import dns from "dns";

console.log("Servers:", dns.getServers());

dns.resolve4("google.com", (err, records) => {
  console.log(err);
  console.log(records);
});