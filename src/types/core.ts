export type Bindings = {
  token: string;
};

export type Variables = {
  user: {
    id: string;
    role: UserRole;
  };
};

export type UserRole = "CANDIDATE" | "ADMIN" | "BUILDER";
