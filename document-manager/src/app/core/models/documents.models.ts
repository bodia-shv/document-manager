import { EUserType } from "./user.model";

export enum EDocumentStatus {
  Draft = 'DRAFT',
  Revoke = 'REVOKE',
  ReadyForReview = 'READY_FOR_REVIEW',
  UnderReview = 'UNDER_REVIEW',
  Approved = 'APPROVED',
  Declined = 'DECLINED'
}

export interface IDocumentCreator {
  email: string;
  fullName: string;
  id: string;
  role: EUserType;
}

export interface IDocument {
  id: string;
  name: string;
  fileUrl: string; 
  status: EDocumentStatus;
  creator?: IDocumentCreator; 
  updatedAt: Date;
  createdAt: Date;
}

export interface IDocumentResponse {
  count: number;
  results: IDocument[];
}