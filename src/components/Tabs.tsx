type TabsProps = {
  activeTab: "reminders" | "recurring"
  onTabChange: (tab: "reminders" | "recurring") => void
}

export const Tabs = ({ activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="flex border-b border-base-300">
      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "reminders"
            ? "text-primary border-b-2 border-primary"
            : "text-base-content/60 hover:text-base-content"
        }`}
        onClick={() => onTabChange("reminders")}
      >
        One-time
      </button>
      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "recurring"
            ? "text-primary border-b-2 border-primary"
            : "text-base-content/60 hover:text-base-content"
        }`}
        onClick={() => onTabChange("recurring")}
      >
        Recurring
      </button>
    </div>
  )
}
