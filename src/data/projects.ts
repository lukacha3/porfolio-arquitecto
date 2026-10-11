// NOTE: This is EXAMPLE content — replace with real Sanity data in phase 4.
// Fields `tone` and `art` are only used for placeholder drawings and will be
// removed once real photos arrive from the CMS.

export interface Project {
  title:    string;
  slug:     string;
  category: string;
  year:     number;
  /** Background color for the placeholder drawing box */
  tone:     string;
  /** Which placeholder art variant to render: 'a' | 'b' | 'c' | 'd' */
  art:      "a" | "b" | "c" | "d";
}

// First item is the featured hero project.
export const projects: Project[] = [
  { title: "Villa Mur",             slug: "villa-mur",            category: "Bostad",  year: 2024, tone: "#D8D4CA", art: "a" },
  { title: "Sjöpaviljongen",        slug: "sjopaviljongen",       category: "Kultur",  year: 2023, tone: "#BDC3BB", art: "d" },
  { title: "Utsiktstornet",         slug: "utsiktstornet",        category: "Bostad",  year: 2022, tone: "#C9CDD0", art: "c" },
  { title: "Kvarterets bibliotek",  slug: "kvarterets-bibliotek", category: "Kultur",  year: 2022, tone: "#D3C8B8", art: "b" },
  { title: "Verkstad Norr",         slug: "verkstad-norr",        category: "Interiör",year: 2021, tone: "#B7BDB3", art: "a" },
  { title: "Gårdshuset",            slug: "gardshuset",           category: "Bostad",  year: 2020, tone: "#CFC9BD", art: "d" },
  { title: "Showroom Ljus",         slug: "showroom-ljus",        category: "Interiör",year: 2025, tone: "#C2C0B8", art: "c" },
];

/** Unique category values in declaration order, deduplicated. */
export const categories: string[] = [...new Set(projects.map((p) => p.category))];
