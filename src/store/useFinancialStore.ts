import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserProfile,
  RetirementPlan,
  Goal,
  IncomeStream,
  CashFlowProjection,
  BucketStrategy,
  Recommendation,
} from '@/types'

interface FinancialState {
  // User Profile
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  
  // Retirement Plan
  retirementPlan: RetirementPlan | null
  setRetirementPlan: (plan: RetirementPlan) => void
  
  // Goals
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  
  // Income Streams
  incomeStreams: IncomeStream[]
  addIncomeStream: (stream: IncomeStream) => void
  updateIncomeStream: (id: string, stream: Partial<IncomeStream>) => void
  deleteIncomeStream: (id: string) => void
  
  // Cash Flow
  cashFlowProjection: CashFlowProjection[]
  setCashFlowProjection: (projection: CashFlowProjection[]) => void
  
  // Bucket Strategy
  bucketStrategy: BucketStrategy | null
  setBucketStrategy: (strategy: BucketStrategy) => void
  
  // Recommendations
  recommendations: Recommendation[]
  setRecommendations: (recommendations: Recommendation[]) => void
  
  // UI State
  isDarkMode: boolean
  toggleDarkMode: () => void
  
  // Reset
  reset: () => void
}

const initialState = {
  profile: null,
  retirementPlan: null,
  goals: [],
  incomeStreams: [],
  cashFlowProjection: [],
  bucketStrategy: null,
  recommendations: [],
  isDarkMode: false,
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setProfile: (profile) => set({ profile }),
      
      setRetirementPlan: (retirementPlan) => set({ retirementPlan }),
      
      addGoal: (goal) =>
        set((state) => ({ goals: [...state.goals, goal] })),
      
      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal
          ),
        })),
      
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
      
      addIncomeStream: (stream) =>
        set((state) => ({ incomeStreams: [...state.incomeStreams, stream] })),
      
      updateIncomeStream: (id, updatedStream) =>
        set((state) => ({
          incomeStreams: state.incomeStreams.map((stream) =>
            stream.id === id ? { ...stream, ...updatedStream } : stream
          ),
        })),
      
      deleteIncomeStream: (id) =>
        set((state) => ({
          incomeStreams: state.incomeStreams.filter((stream) => stream.id !== id),
        })),
      
      setCashFlowProjection: (cashFlowProjection) =>
        set({ cashFlowProjection }),
      
      setBucketStrategy: (bucketStrategy) => set({ bucketStrategy }),
      
      setRecommendations: (recommendations) => set({ recommendations }),
      
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newMode)
          }
          return { isDarkMode: newMode }
        }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'roboadvisor-storage',
      partialize: (state) => ({
        profile: state.profile,
        retirementPlan: state.retirementPlan,
        goals: state.goals,
        incomeStreams: state.incomeStreams,
        bucketStrategy: state.bucketStrategy,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
)
