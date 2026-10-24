from datetime import date
from jobfeed import wanted, city_of, recent
assert wanted("Software Engineer") and wanted("SDE-1") and wanted("Frontend Developer")
assert not wanted("Senior Software Engineer") and not wanted("SDE 2") and not wanted("Software Engineer II")
assert not wanted("Data Analyst") and not wanted("Software Engineer Intern")
assert city_of("Bangalore, India") == "Bengaluru" and city_of("Gurugram") == "Delhi NCR"
assert city_of("San Francisco, CA") is None
d = date(2026, 10, 24)
assert recent("2026-10-17", d) and recent("2026-10-24T09:00:00", d)
assert not recent("2026-10-16", d) and not recent("", d)
print("ok")
