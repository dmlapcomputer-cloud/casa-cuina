import type { IAfterOffice } from "@/types/after-office/after-office-intreface";
import type { RawAfterResponse } from "@/types/Linktree/Booking-interfaceRequest";
import apiClient from "../api/api";

export const AfterOfficeService = {
  async postAfter(afterData: IAfterOffice): Promise<RawAfterResponse> {
    try {
      const { data } = await apiClient.post<RawAfterResponse>('after', afterData);
      return data;
    } catch (error) {
      console.error("Error guadar After office", error);
      throw error;
    }
  }
}
