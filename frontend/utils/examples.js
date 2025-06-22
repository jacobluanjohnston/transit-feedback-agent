export const EXAMPLES = `
────────────────────────────────────────
EXAMPLE 1 – Event-day cleanliness spike
Input JSON (trimmed):
{
 "labels":["Beyoncé (2025-06-14)","Giants Game (2025-06-18)"],
 "datasets":[
   {"label":"Same-Day","data":[32,15]},
   {"label":"Next-Day","data":[14, 6]},
   {"label":"Baseline avg","data":[3.2,3.2]},
   {"label":"% Above Baseline","data":[900,370]}
 ]}
Expected markdown:
**Key insight:** Stadium events generate a **10 ×** surge in cleanliness complaints (32 vs 3 baseline) with spill-over persisting next morning.  
- **Action:** deploy an extra trash crew within 1 h post-event and keep bins until noon next day.

────────────────────────────────────────
EXAMPLE 2 – Rush-hour delay pattern
Input JSON:
{
 "labels":["06:00","07:00","08:00","09:00"],
 "datasets":[
   {"label":"Weekday","data":[4,18,21,12]},
   {"label":"Weekend","data":[1, 2, 3, 2]}
 ]}
Expected markdown:
**Key insight:** Delays peak at **08:00 on weekdays (21 reports)**—seven times weekend levels.  
- **Action:** stage two standby buses 07 : 30–08 : 30 on workdays.

────────────────────────────────────────
EXAMPLE 3 – Hot-stop harassment & weekend share
Input JSON:
{
 "labels":["16 St Mission","Powell","Civic Center"],
 "datasets":[
   {"label":"Weekday","data":[12,4,3]},
   {"label":"Weekend","data":[18,9,8]}
 ],
 "agencies":["BART","BART","BART"]
}
Expected markdown:
**Key insight:** **16 St Mission** tops the list: 30 harassment reports, **60 % on weekends**.  
Powell and Civic Center trail far behind.  
- **Action:** post visible security on Sat/Sun nights at 16 St Mission.

────────────────────────────────────────
EXAMPLE 4 – Temperature vs equipment failures
Input JSON (5 °F buckets):
{
 "labels":["70","75","80","85","90"],
 "datasets":[
   {"label":"Failures","data":[3,5,8,12,18]},
   {"label":"Trend","data":[2.6,6.1,9.6,13.1,16.6]}
 ],
 "annotation":{"r":0.78}
}
Expected markdown:
**Key insight:** Failures rise with heat (**r = 0.78**); >90 °F saw **18 failures vs 3 at 70 °F**.  
- **Action:** schedule pre-emptive inspections when forecasts exceed 88 °F.

────────────────────────────────────────
EXAMPLE 5 – Tag frequency distribution
Input JSON:
{
 "labels":["delay","harassment","cleanliness","equipment_issue"],
 "datasets":[
   {"label":"Tag Frequency","data":[210,132,94,76]}
 ]}
Expected markdown:
**Key insight:** “Delay” dominates complaints (**210 reports, 34 % of total**).  
Harassment and cleanliness follow; equipment issues are least common.  
- **Action:** prioritise delay-mitigation efforts before lesser categories.

────────────────────────────────────────
EXAMPLE 6 – Agency report frequency
Input JSON:
{
 "labels":["MUNI","BART","VTA Bus","VTA Light-Rail"],
 "datasets":[
   {"label":"Agency Reports","data":[158,121,44,32]}
 ]}
Expected markdown:
**Key insight:** **MUNI accounts for the largest share (158 reports)**—30 % more than BART.  
VTA services combined represent under 25 % of total.  
- **Action:** focus immediate service-reliability fixes on MUNI lines.

────────────────────────────────────────
EXAMPLE 7 – Reports over time trend
Input JSON (daily):
{
 "labels":["2025-06-10","2025-06-11","2025-06-12","2025-06-13"],
 "datasets":[
   {"label":"Reports by Date","data":[12,15,42,14]}
 ]}
Expected markdown:
**Key insight:** Complaints spiked to **42 on 12 June**, triple the three-day average, then returned to normal.  
- **Action:** investigate incidents on 12 June (operator logs & CCTV) to prevent recurrence.
────────────────────────────────────────
`;
