"use server";

import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createChatRoom(participantIds: string[], isGroup: boolean, name?: string) {
  const user = await requireAuth();

  // Find the user's employee profile
  const authorProfile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!authorProfile) throw new Error("Employee profile not found");

  // Include the current user in participants if not already included
  const allParticipantIds = Array.from(new Set([...participantIds, authorProfile.id]));

  if (!isGroup && allParticipantIds.length === 2) {
    // Check if a 1-on-1 chat already exists between these two exact people
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { employeeId: allParticipantIds[0] } } },
          { participants: { some: { employeeId: allParticipantIds[1] } } }
        ]
      }
    });

    if (existingRoom) return existingRoom.id;
  }

  const room = await prisma.chatRoom.create({
    data: {
      isGroup,
      name: isGroup ? name : null,
      participants: {
        create: allParticipantIds.map(empId => ({
          employeeId: empId
        }))
      }
    }
  });

  revalidatePath("/messages");
  return room.id;
}

export async function sendMessage(roomId: string, content: string) {
  const user = await requireAuth();

  const authorProfile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!authorProfile) throw new Error("Employee profile not found");
  if (!content.trim()) throw new Error("Message cannot be empty");

  // Verify user is in this room
  const participation = await prisma.chatParticipant.findUnique({
    where: {
      roomId_employeeId: {
        roomId,
        employeeId: authorProfile.id
      }
    }
  });

  if (!participation) throw new Error("You are not a participant of this chat room");

  const message = await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      roomId,
      authorId: authorProfile.id
    },
    include: {
      author: {
        include: { user: true }
      }
    }
  });

  // Update room's updatedAt timestamp for sorting active chats
  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() }
  });

  return message;
}

export async function getRooms() {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) return [];

  const rooms = await prisma.chatRoom.findMany({
    where: {
      participants: {
        some: { employeeId: profile.id }
      }
    },
    include: {
      participants: {
        include: {
          employee: { include: { user: true } }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return rooms.map(room => {
    // If it's a 1-on-1 chat, the "name" of the room should be the other person's name
    let displayName = room.name;
    let displayAvatar = null;
    
    if (!room.isGroup) {
      const otherPerson = room.participants.find(p => p.employeeId !== profile.id)?.employee;
      displayName = otherPerson?.user.name || "Unknown User";
      displayAvatar = otherPerson?.avatarUrl;
    }

    return {
      ...room,
      displayName,
      displayAvatar,
      latestMessage: room.messages[0] || null
    };
  });
}

export async function getMessages(roomId: string) {
  const user = await requireAuth();

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) throw new Error("Profile not found");

  // Verify access
  const access = await prisma.chatParticipant.findUnique({
    where: { roomId_employeeId: { roomId, employeeId: profile.id } }
  });

  if (!access) throw new Error("Unauthorized");

  const messages = await prisma.chatMessage.findMany({
    where: { roomId },
    include: {
      author: { include: { user: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return {
    messages,
    currentUserId: profile.id
  };
}
