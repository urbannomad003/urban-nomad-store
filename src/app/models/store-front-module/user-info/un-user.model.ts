import { LoyaltyMemberDetailsModel } from "./loyalty-member-details.model";
import { PhysicalAddressModel } from "./physical-address.model";

export interface UnUserModel {
    userId: string;
    title?: string | null;
    firstName: string;
    lastName: string;
    emailAddress: string;
    dateOfBirth?: string | null;
    isLoyaltyMember: boolean;
    loyaltyMemberDetails: LoyaltyMemberDetailsModel | null;
    physicalAddress: PhysicalAddressModel | null;
    createdAt: string;
    updatedAt: string;
}