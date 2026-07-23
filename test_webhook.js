

async function test() {
  const url = "https://script.google.com/macros/s/AKfycbw0lMJZAP2qWp3JUTqIl--oUUjIc__AYsjPPI6w9TnnrukpK6k7cb_A4iAhNMppiU141g/exec";
  const res = await fetch(url, {
    method: "GET",
    method: "GET",
    redirect: "follow"
  });
  const text = await res.text();
  console.log(res.status, text.substring(0, 100));
}
test();
