import type { ResultSet } from "@/marketing/lib/content";

export const results2026: ResultSet[] = [
  {
    year: 2026,
    eventName: "APEX J — Tonanitla",
    eventDate: "2026-09-20",
    distance: "10K",
    rows: [
      {
        place: 1,
        bib: "23",
        name: "EMMANUEL BAUTISTA",
        time: "35:18.2",
        gap: "",
        laps: [
          {
            index: 1,
            time: "18:00.7",
            place: 2,
            cumulativeTime: "18:00.7",
            cumulativePlace: 2,
          },
          {
            index: 2,
            time: "17:17.1",
            place: 1,
            cumulativeTime: "35:17.8",
            cumulativePlace: 1,
          },
        ],
      },
      {
        place: 2,
        bib: "20",
        name: "ALONSO ROQUE",
        time: "37:33.5",
        gap: "+2:15.3",
        laps: [
          {
            index: 1,
            time: "18:30.4",
            place: 3,
            cumulativeTime: "18:30.4",
            cumulativePlace: 3,
          },
          {
            index: 2,
            time: "19:02.2",
            place: 2,
            cumulativeTime: "37:32.6",
            cumulativePlace: 2,
          },
        ],
      },
      {
        place: 3,
        bib: "24",
        name: "ERICK YAEL JIMENEZ MAURICIO",
        time: "41:56.4",
        gap: "+6:38.2",
        laps: [],
      },
    ],
  },
  {
    year: 2026,
    eventName: "APEX J — Tonanitla",
    eventDate: "2026-09-20",
    distance: "5K",
    rows: [
      {
        place: 1,
        bib: "101",
        name: "ANA CORREDORA EJEMPLO",
        time: "21:05.0",
        gap: "",
        laps: [],
      },
      {
        place: 2,
        bib: "108",
        name: "LUIS CORREDOR EJEMPLO",
        time: "22:40.1",
        gap: "+1:35.1",
        laps: [],
      },
    ],
  },
];

export const results2025: ResultSet[] = [
  {
    year: 2025,
    eventName: "Mayáhuel Trail",
    eventDate: "2025-11-15",
    distance: "21K",
    rows: [
      {
        place: 1,
        bib: "7",
        name: "CORREDOR DEMO 2025",
        time: "1:42:10",
        gap: "",
        laps: [],
      },
    ],
  },
];

export const resultsByYear: Record<number, ResultSet[]> = {
  2026: results2026,
  2025: results2025,
  2024: [],
  2023: [],
  2022: [],
  2021: [],
};

export const resultYears = [2026, 2025, 2024, 2023, 2022, 2021];
