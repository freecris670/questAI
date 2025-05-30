export interface IUser {
  id: string;
  name: string;
  level: number;
  levelProgress: number;
  xpNeeded: number;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}

export interface IUserStats {
  level: number;
  levelProgress: number;
  xpNeeded: number;
  name: string;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}

export interface IUserProfile {
  id: string;
  name: string;
  level: number;
  levelProgress: number;
  xpNeeded: number;
  questsCreated: number;
  questsCompleted: number;
  successRate: number;
}

export interface IUserSubscription {
  id: string;
  planName: string;
  isActive: boolean;
  expiresAt: string;
  features: string[];
}
