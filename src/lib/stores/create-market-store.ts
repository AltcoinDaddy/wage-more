import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateMarketFormValues } from "~/lib/validators/market";

interface CreateMarketStore {
  formValues: Partial<CreateMarketFormValues>;
  setFormValues: (values: Partial<CreateMarketFormValues>) => void;
  resetForm: () => void;
}

const initialState: Partial<CreateMarketFormValues> = {
  title: "",
  description: "",
  imageUrl: "",
  tags: [],
  marketType: "BINARY",
  options: [{ name: "Yes" }, { name: "No" }],
  // optimization: don't persist endTime default, let component handle it
  // or store as ISO string if needed, but here we keep it simple
};

export const useCreateMarketStore = create<CreateMarketStore>()(
  persist(
    (set) => ({
      formValues: initialState,
      setFormValues: (values) =>
        set((state) => ({
          formValues: { ...state.formValues, ...values },
        })),
      resetForm: () => set({ formValues: initialState }),
    }),
    {
      name: "create-market-storage",
      // Optional: partialize if we only want to save specific fields
    }
  )
);
