export enum PassType {
  EARLY_LEAVE = "EARLY_LEAVE",
  OUTING = "OUTING",
}

export enum PassStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export interface Pass {
  id: string;
  type: PassType;
  startTime: Date;
  returnTime?: Date;
  reason: string;
  status: PassStatus;
  rejectReason?: string;
  student: {
    firstName: string;
    lastName: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
  qrCode?: string;
}
