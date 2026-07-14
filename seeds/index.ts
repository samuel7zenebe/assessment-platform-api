import { db } from "@/src/db/index.js";
import {
  departments,
  permissionPolicies,
  jobTitles,
  user as UserSchema,
  exams,
  questionBank,
} from "@/src/db/schema.js";
import { userRepo } from "@/src/routes/users/usersRepo.js";
import jobTitlesData from "./data-set/job-titles.json" with { type: "json" };
import { auth } from "@/src/lib/auth.js";
import { eq } from "drizzle-orm";
import { traineeSoftwareEngineerQuestions } from "./data-set/questions.js";
import { QuestionBankRepo } from "@/src/routes/questions/questionBankRepo.js";
import type { QuestionBankCreateType } from "@/src/routes/questions/schema.js";

const departments_data = [
  {
    departmentId: "DEPT001",
    name: "Sourcing And Procuremment",
    description:
      "Responsible for sourcing and purchasing raw materials, fuels, spare parts, and services for the cement plant, including supplier qualification, contract management, and on-time delivery coordination.",
    dgmName: "",
    managerId: "EPLD0070",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT002",
    name: "Relationship Management And Customer Support",
    description:
      "Manages customer accounts and support, including order coordination, complaint handling, technical/application assistance, and capturing market feedback to improve service and product performance.",
    dgmName: "",
    managerId: "EPLS0035",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT003",
    name: "Quality Control And Optimization",
    description:
      "Ensures product and process quality through laboratory testing and process monitoring of raw materials, clinker, and cement; drives optimization to meet standards, improve consistency, and reduce losses.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT004",
    name: "Program Improvement",
    description:
      "Leads continuous improvement initiatives across operations and support functions by tracking KPIs, standardizing processes, facilitating problem-solving, and implementing productivity and cost-reduction programs.",
    dgmName: "",
    managerId: "EPLS0007",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT005",
    name: "PP Bags Production Plant",
    description:
      "Produces and supplies polypropylene (PP) cement bags, including printing and quality checks, to ensure reliable packaging availability for plant dispatch and customer requirements.",
    dgmName: "",
    managerId: "EPLS0022",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT006",
    name: "Plant Operation",
    description:
      "Operates the cement production process end-to-end (raw material handling, kiln/clinker production, cement grinding, packing, and dispatch) to achieve safe, stable, and efficient output.",
    dgmName: "",
    managerId: "EPLH0115",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT007",
    name: "Asset Management",
    description:
      "Manages the lifecycle and reliability of plant assets by defining maintenance strategies, tracking asset performance, optimizing spare parts and criticality, and supporting capital planning and upgrades.",
    dgmName: "",
    managerId: "EPLJ0005",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT008",
    name: "Addis Abeba Office",
    description:
      "Provides a city-based coordination office to support commercial, administrative, and stakeholder engagements, improving responsiveness to customers, partners, and regulatory communications.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT009",
    name: "Human Resources",
    description:
      "Oversees workforce planning, recruitment, training, performance management, payroll/benefits administration, and employee relations to ensure compliant and capable staffing for plant operations.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT010",
    name: "Engineering And Utility",
    description:
      "Provides engineering support and technical solutions for mechanical, electrical, and instrumentation needs, and manages utilities (power, water, compressed air, etc.) to maintain stable plant services.",
    dgmName: "",
    managerId: "EPLM0044",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT011",
    name: "Enterprise Services",
    description:
      "Delivers essential general services that enable plant operations, such as administration, facilities management, transport/fleet coordination, security, and site support services.",
    dgmName: "",
    managerId: "EPLW0021",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT012",
    name: "General Manager Office",
    description:
      "Provides overall leadership and governance for the plant, coordinating strategic priorities, management reporting, cross-functional decision-making, and key stakeholder communication.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT013",
    name: "Third Line Project Coordinator",
    description:
      "Coordinates planning and execution of the third production line project, including scope control, schedules, contractor oversight, budget tracking, risk management, and commissioning readiness.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT014",
    name: "Maintenance Planning And COE",
    description:
      "Plans and schedules preventive and corrective maintenance while serving as a Center of Excellence (COE) for reliability standards, shutdown planning, work management, and best-practice maintenance systems.",
    dgmName: "",
    managerId: "EPLH0094",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT015",
    name: "Information Communication Technology",
    description:
      "Maintains the plant’s ICT infrastructure and business systems, including networks, hardware, software applications, cybersecurity, data services, and end-user support.",
    dgmName: "",
    managerId: "EPLS0129",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT016",
    name: "Finance And Accounting",
    description:
      "Manages financial planning and control, accounting and reporting, treasury and cash management, tax compliance, cost accounting, and support for internal/external audits.",
    dgmName: "",
    managerId: "EPLT0105",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT017",
    name: "Legal Service",
    description:
      "Provides legal advisory and compliance support, including contract review, regulatory guidance, dispute resolution, and risk mitigation for plant operations and commercial activities.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT018",
    name: "Internal Audit Service",
    description:
      "Conducts independent audits and reviews of processes and controls to strengthen governance, manage risk, ensure compliance, and identify opportunities to prevent errors and fraud.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT019",
    name: "Community Relations",
    description:
      "Builds and maintains positive relationships with surrounding communities through engagement, grievance handling, CSR initiatives, and coordination on local impact management and communications.",
    dgmName: "",
    managerId: "EPLG0336",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT020",
    name: "Strategy And Business Development",
    description:
      "Develops and drives the plant’s growth agenda through market analysis, strategic planning, pricing and product strategy support, partnership development, and evaluation of new business opportunities.",
    dgmName: "",
    managerId: "EPLS0099",
    createdAt: "2026-04-29T18:39:08.514Z",
  },
  {
    departmentId: "DEPT021",
    name: "Research And Innovation",
    description:
      "Leads research, trials, and innovation to improve cement products and processes, including alternative raw materials/fuels, sustainability initiatives, and piloting new technologies and methods.",
    dgmName: "",
    managerId: null,
    createdAt: "2026-04-29T18:39:08.514Z",
  },
];

export async function seedDepartments() {
  await db.delete(departments);
  const deps = await db
    .insert(departments)
    .values(
      departments_data.map((dep) => ({
        id: dep.departmentId,
        name: dep.name,
        description: dep.description,
        managerId: dep.managerId,
        dgmName: dep.dgmName,
      })),
    )
    .returning({ id: departments.id });

  console.log(deps.length, "departments seeded successfully");
}

export async function seedJobTitles() {
  await db.delete(jobTitles);

  const formattedJobTitles = jobTitlesData.map((jobTitle) => ({
    titleName: jobTitle.titleName,
    departmentId: jobTitle.departmentId,
  }));

  const jobTitlesInserted = await db
    .insert(jobTitles)
    .values(formattedJobTitles)
    .returning({ id: jobTitles.id });

  console.log(jobTitlesInserted.length, "job titles seeded successfully");
}

export async function createAdmin() {
  await db.delete(UserSchema).where(eq(UserSchema.email, "samuel@admin.com"));
  const user = await auth.api.createUser({
    body: {
      email: "samuel@admin.com",
      name: "Samuel The Admin",
      role: "ADMIN",
      password: "admin@admin",
      data: {
        isActive: true,
        tempCandidate: false,
        departmentId: "DEPT015",
        username: "samuelAdmin",
        displayUsername: "Samuel THe Admin",
      },
    },
  });

  console.log("User create : ", user.user.name);
}

export async function seedPermissionPolicies() {
  const policies = await db
    .insert(permissionPolicies)
    .values([
      {
        actions: ["CREATE"],
        resource: "QUESTION",
        scope: "DEPARTMENT",
        scopeId: "DEPT015",
        createdAt: new Date(),
        userId: "CGnPrmzbuWj9qI5lfzStEys8OkBdaezC",
      },
    ])
    .returning({ id: permissionPolicies.id });

  console.log(policies.length, "permission policies seeded successfully");
}

export async function seedQuestions() {
  try {
    let newQuestionId = [];
    for (const question of traineeSoftwareEngineerQuestions) {
      const newQuestion = await QuestionBankRepo.createQuestionBankRecord({
        ...question,
        jobTitles: ["b146945b-60fa-4c08-aa90-45b61898d6a5"],
        createdBy: "0pkBd4tC5ubiPZmoAwdHxnZORNr3KD8c",
      });
      newQuestionId.push(newQuestion);
    }
  } catch (err) {
    console.log("Failed to seed questions ", err);
  }
}

export async function AutoDo() {
  try {
    await db.update(questionBank).set({
      points: 1,
    });
  } catch (err) {
    console.log("Failed to seed questions ", err);
  }
}

// seedDepartments();
// seedJobTitles();
seedPermissionPolicies();
// createAdmin();

// seedQuestions();

// AutoDo();
