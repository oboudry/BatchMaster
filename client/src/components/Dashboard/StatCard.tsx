import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: ReactNode;
  iconBgColor: string;
  iconTextColor: string;
  changeIcon: ReactNode;
  changeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  iconTextColor,
  changeIcon,
  changeColor
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-5">
      <div className="flex justify-between">
        <div>
          <h3 className="text-base text-gray-500 font-normal">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <div className={`${iconTextColor} ${iconBgColor} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          <span className={changeColor}>{changeIcon}</span>
          <span className="text-sm text-gray-600 ml-1">{change}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
