import { ReactNode } from "react";

interface ActivityItemProps {
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  message: string;
  timestamp: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  iconBgColor,
  iconTextColor,
  message,
  timestamp
}) => {
  return (
    <li className="py-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className={`${iconBgColor} p-2 rounded-full`}>
            <span className={`${iconTextColor}`}>{icon}</span>
          </span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: message }} />
          <p className="text-sm text-gray-500">{timestamp}</p>
        </div>
      </div>
    </li>
  );
};

export default ActivityItem;
