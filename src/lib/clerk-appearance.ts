export const clerkAuthAppearance = {
  elements: {
    card: "bg-transparent shadow-none p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    formFieldLabel: "text-slate-200",
    formFieldInput:
      "rounded-lg border border-slate-700 bg-slate-950/40 text-slate-50 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30",
    formButtonPrimary:
      "h-10 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold",
    socialButtonsBlockButton:
      "h-10 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-center gap-2",
    dividerLine: "bg-slate-700",
    dividerText: "text-slate-400",
    footerActionText: "text-slate-400",
    footerActionLink: "text-emerald-300 hover:text-emerald-200",
    formFieldErrorText: "text-red-300",
  },
} as const;

