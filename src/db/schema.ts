import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  decimal,
  uuid,
  pgEnum,
  primaryKey,
  unique,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import type { z } from "zod";
import type { QuestionDataSchema } from "@/src/routes/questions/schema.js";

/* =========================================================
   ENUMS
========================================================= */

export const userRoleEnum = pgEnum("user_role", [
  "CANDIDATE",
  "ADMIN",
  "BUILDER",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "CHOICE",
  "MATCH",
  "ESSAY",
  "TRUE_FALSE",
]);

export const difficultyLabelEnum = pgEnum("difficulty_level", [
  "EASY",
  "MEDIUM",
  "HARD",
]);

export const examStatusEnum = pgEnum("exam_status", [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "ASSIGNED",
  "STARTED",
  "COMPLETED",
  "EXPIRED",
]);

export const attemptStatusEnum = pgEnum("attempt_status", [
  "IN_PROGRESS",
  "SUBMITTED",
  "GRADED",
  "EXPIRED",
]);

export const examGenerationModeEnum = pgEnum("exam_generation_mode", [
  "QUESTION_COUNT",
  "POINT_TARGET",
  "HYBRID",
]);

/* =========================================================
   BETTER AUTH TABLES
========================================================= */

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),

    firstName: varchar("first_name", {
      length: 255,
    }),

    lastName: varchar("last_name", {
      length: 255,
    }),

    name: text("name").notNull(),

    email: text("email").notNull(),

    emailVerified: boolean("email_verified").default(false).notNull(),

    image: text("image"),

    passwordHash: text("password_hash"),

    role: userRoleEnum("role").default("CANDIDATE").notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    banned: boolean("banned"),

    banReason: text("ban_reason"),

    banExpires: timestamp("ban_expires", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    unique("user_email_unique").on(table.email),

    index("user_role_idx").on(table.role),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    token: text("token").notNull().unique(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    impersonatedBy: text("impersonated_by"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),

    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    accessToken: text("access_token"),

    refreshToken: text("refresh_token"),

    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),

    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),

    scope: text("scope"),

    password: text("password"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),

    value: text("value").notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/* =========================================================
   EXAMS
========================================================= */

export const exams = pgTable(
  "exams",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 255,
    }).notNull(),

    description: text("description"),

    estimatedTimeMinutes: integer("estimated_time_minutes").notNull(),

    scheduledTime: timestamp("scheduled_time", {
      withTimezone: true,
    }),

    passPercentage: integer("pass_percentage").notNull(),
    generationMode: examGenerationModeEnum("generation_mode")
      .default("QUESTION_COUNT")
      .notNull(),

    totalQuestions: integer("total_questions"),

    targetPoints: integer("target_points"),

    difficultyLevel: integer("difficulty_level").notNull(),
    status: examStatusEnum("status").default("DRAFT").notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [index("exam_created_by_idx").on(table.createdBy)],
);

/* =========================================================
   QUESTION BANK
========================================================= */

export const questionBank = pgTable(
  "question_bank",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", {
      length: 255,
    }),
    category: varchar("category", {
      length: 255,
    }),

    type: questionTypeEnum("type").default("CHOICE").notNull(),

    question: text("question").notNull(),

    difficultyLabel: difficultyLabelEnum("difficulty_label")
      .default("MEDIUM")
      .notNull(),

    /*
      Optional media support
    */

    imageUrl: text("image_url"),
    audioUrl: text("audio_url"),
    videoUrl: text("video_url"),

    /// estimatedTimeSeconds
    estimatedTimeSeconds: integer("estimated_time_seconds")
      .notNull()
      .default(60),

    points: integer("points").default(1).notNull(),
    /*
      Optional explanation shown after submission
    */
    explanation: text("explanation"),

    /*
      Core flexible configuration
    */
    questionData:
      jsonb("question_data").$type<z.infer<typeof QuestionDataSchema>>(),
    /*
      Question behavior flags
    */
    isActive: boolean("is_active").default(true).notNull(),

    isPublic: boolean("is_public").default(false).notNull(),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),

    /*
      Optional versioning
    */
    version: integer("version").default(1).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("question_type_idx").on(table.type),
    index("question_difficulty_idx").on(table.difficultyLabel),
    index("question_created_by_idx").on(table.createdBy),
    index("question_active_idx").on(table.isActive),
  ],
);

/* =========================================================
   QUESTION CHOICES
========================================================= */

export const questionChoices = pgTable(
  "question_choices",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    questionId: uuid("question_id")
      .notNull()
      .references(() => questionBank.id, {
        onDelete: "cascade",
      }),

    choiceText: text("choice_text").notNull(),
    /*
      Used internally
    */
    choiceKey: varchar("choice_key", {
      length: 10,
    }),
    isCorrect: boolean("is_correct").default(false).notNull(),
    explanation: text("explanation"),
    displayOrder: integer("display_order").default(0).notNull(),
    createAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("question_choices_question_id_idx").on(table.questionId)],
);

/* =========================================================
   JOB TITLES
========================================================= */

export const jobTitles = pgTable("job_titles", {
  id: uuid("id").defaultRandom().primaryKey(),

  titleName: varchar("title_name", {
    length: 255,
  })
    .notNull()
    .unique(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================================================
   QUESTION JOB TITLES
========================================================= */

export const questionJobTitles = pgTable(
  "question_job_titles",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questionBank.id, {
        onDelete: "cascade",
      }),

    jobTitleId: uuid("job_title_id")
      .notNull()
      .references(() => jobTitles.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.questionId, table.jobTitleId],
    }),
  }),
);

/* =========================================================
   EXAM QUESTIONS
========================================================= */

export const examQuestions = pgTable(
  "exam_questions",
  {
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),

    questionId: uuid("question_id")
      .notNull()
      .references(() => questionBank.id, {
        onDelete: "cascade",
      }),

    questionOrder: integer("question_order").notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.examId, table.questionId],
    }),
  }),
);

/* =========================================================
   EXAM CANDIDATES
========================================================= */

export const examCandidates = pgTable(
  "exam_candidates",
  {
    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),

    candidateId: text("candidate_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    assignmentStatus: assignmentStatusEnum("assignment_status")
      .default("ASSIGNED")
      .notNull(),

    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.examId, table.candidateId],
    }),
  }),
);
/*========================================================
EXAM JOBTITLES
=========================================================*/
export const examJobTitles = pgTable(
  "exam_job_titles",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),

    jobTitleId: uuid("job_title_id")
      .notNull()
      .references(() => jobTitles.id, {
        onDelete: "cascade",
      }),

    /*
      Percentage weight of questions generated
      from this job title.

      Example:
      Backend = 70
      DevOps = 30
    */
    weightPercentage: integer("weight_percentage").default(100).notNull(),

    /*
      Marks the main focus role
    */
    isPrimary: boolean("is_primary").default(false).notNull(),

    /*
      Optional custom question count
      specifically for this job title.
    */
    questionCount: integer("question_count"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_exam_job_title").on(table.examId, table.jobTitleId),

    index("exam_job_title_exam_idx").on(table.examId),

    index("exam_job_title_job_idx").on(table.jobTitleId),
  ],
);

/* =========================================================
   EXAM ATTEMPTS
========================================================= */

export const examAttempts = pgTable(
  "exam_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    examId: uuid("exam_id")
      .notNull()
      .references(() => exams.id, {
        onDelete: "cascade",
      }),

    candidateId: text("candidate_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    attemptNumber: integer("attempt_number").default(1).notNull(),

    startedAt: timestamp("started_at", {
      withTimezone: true,
    }).defaultNow(),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
    }),

    score: decimal("score", {
      precision: 5,
      scale: 2,
    }),

    passed: boolean("passed"),

    status: attemptStatusEnum("status").default("IN_PROGRESS").notNull(),
  },
  (table) => [
    index("exam_attempt_candidate_idx").on(table.candidateId),

    unique("unique_exam_attempt").on(
      table.examId,
      table.candidateId,
      table.attemptNumber,
    ),
  ],
);
/* =========================================================
   ATTEMPT Questions 
========================================================= */

export const attemptQuestions = pgTable(
  "attempt_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    attemptId: uuid("attempt_id")
      .notNull()
      .references(() => examAttempts.id, {
        onDelete: "cascade",
      }),

    questionId: uuid("question_id")
      .notNull()
      .references(() => questionBank.id),

    questionOrder: integer("question_order").notNull(),

    /*
      Immutable copy of question
      at exam start time
    */
    questionSnapshot: jsonb("question_snapshot").notNull(),

    /*
      Optional shuffled choices
    */
    shuffledChoices: jsonb("shuffled_choices"),

    /*
      Track if candidate viewed question
    */
    viewedAt: timestamp("viewed_at", {
      withTimezone: true,
    }),

    answeredAt: timestamp("answered_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("unique_attempt_question").on(table.attemptId, table.questionId),

    index("attempt_question_attempt_idx").on(table.attemptId),
  ],
);
/* =========================================================
   ANSWERS
========================================================= */

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /*
      Which attempt-question this answer belongs to
    */
    attemptQuestionId: uuid("attempt_question_id")
      .notNull()
      .references(() => attemptQuestions.id, {
        onDelete: "cascade",
      }),

    /*
      Choice-based answers
      (MCQ, multi-select, etc.)
    */
    selectedChoiceId: uuid("selected_choice_id").references(
      () => questionChoices.id,
      {
        onDelete: "set null",
      },
    ),

    /*
      Essay / text answers
    */
    answerText: text("answer_text"),

    /*
      TRUE / FALSE answers
    */
    booleanAnswer: boolean("boolean_answer"),

    /*
      Flexible structured answers
      (MATCH, ORDERING, etc.)
    */
    answerJson: jsonb("answer_json"),

    /*
      Auto/manual grading result
    */
    isCorrect: boolean("is_correct"),

    /*
      Final awarded score
    */
    awardedPoints: decimal("awarded_points", {
      precision: 5,
      scale: 2,
    }),

    /*
      Manual review workflow
    */
    manuallyReviewed: boolean("manually_reviewed").default(false).notNull(),

    reviewedBy: text("reviewed_by").references(() => user.id, {
      onDelete: "set null",
    }),

    reviewedAt: timestamp("reviewed_at", {
      withTimezone: true,
    }),

    reviewerFeedback: text("reviewer_feedback"),

    /*
      Audit/timing
    */
    answeredAt: timestamp("answered_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("answers_attempt_question_idx").on(table.attemptQuestionId),

    index("answers_reviewed_by_idx").on(table.reviewedBy),
  ],
);

/* =========================================================
   AUDIT LOGS
========================================================= */

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
  }),

  entityName: varchar("entity_name", {
    length: 255,
  }).notNull(),

  entityId: uuid("entity_id").notNull(),

  action: varchar("action", {
    length: 100,
  }).notNull(),

  changes: jsonb("changes"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* =========================================================
   RELATIONS
========================================================= */

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),

  accounts: many(account),

  createdExams: many(exams),

  createdQuestions: many(questionBank),

  attempts: many(examAttempts),
}));

export const examRelations = relations(exams, ({ one, many }) => ({
  creator: one(user, {
    fields: [exams.createdBy],
    references: [user.id],
  }),

  questions: many(examQuestions),

  candidates: many(examCandidates),

  attempts: many(examAttempts),
}));

export const questionBankRelations = relations(questionBank, ({ many }) => ({
  choices: many(questionChoices),
  exams: many(examQuestions),
  answers: many(answers),
}));
