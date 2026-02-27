export const PROGRAM_DEPARTMENTS = {
    "B.Tech.": [
        "Applied Science and Humanities",
        "Mechanical Engineering",
        "Electronics and Telecommunication Engineering",
        "Computer Engineering",
        "Information Technology Engineering",
        "Civil Engineering",
        "Computer Science & Engineering (AI-ML)",
        "Computer Engineering (Regional)",
        "Multidisciplinary Studies"
    ],
    "M.Tech.": [
        "Computer Engineering",
        "(E&TC) - VLSI Engineering",
        "(Mechanical) - Design Engineering",
        "(Mechanical) - Computational Mechanics",
        "(AI & DS)",
        "(Civil) - Construction & Management"
    ],
    "MCA": [
        "Master of Computer Applications"
    ],
    "Ph.D.": [
        "Mechanical Engineering",
        "Computer Engineering",
        "Electronics & Telecommunication Engineering",
        "Civil Engineering"
    ],
    "B.Voc.": [
        "Bachelor of Vocation"
    ],
    "B.Tech. For Working Professionals": [
        "B.Tech. For Working Professionals"
    ]
};

// For places that just need a flat array (like legacy filters that haven't been migrated yet)
export const DEPARTMENTS = Object.values(PROGRAM_DEPARTMENTS).flat();
