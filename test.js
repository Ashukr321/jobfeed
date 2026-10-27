const assert = require("assert");
const { wanted, cityOf, recent } = require("./lib/daily");

assert(wanted("Software Engineer") && wanted("SDE-1") && wanted("Frontend Developer"));
assert(!wanted("Senior Software Engineer") && !wanted("SDE 2") && !wanted("Software Engineer II"));
assert(!wanted("Data Analyst") && !wanted("Software Engineer Intern"));
assert(cityOf("Bangalore, India") === "Bengaluru" && cityOf("Gurugram") === "Delhi NCR");
assert(cityOf("San Francisco, CA") === null);
const d = new Date("2026-10-24T12:00:00Z");
assert(recent("2026-10-17", d) && recent("2026-10-24T09:00:00", d));
assert(!recent("2026-10-16", d) && !recent("", d));
console.log("ok");
