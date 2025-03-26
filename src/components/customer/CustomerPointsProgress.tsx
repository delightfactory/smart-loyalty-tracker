
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Customer } from '@/lib/types';

interface CustomerPointsProgressProps {
  customer: Customer;
  className?: string;
}

const CustomerPointsProgress = ({ customer, className }: CustomerPointsProgressProps) => {
  // تحديد المستويات المختلفة ومتطلباتها من النقاط
  const pointLevels = useMemo(() => [
    { name: 'برونزي', required: 500, color: 'bg-amber-500' },
    { name: 'فضي', required: 1000, color: 'bg-slate-400' },
    { name: 'ذهبي', required: 2000, color: 'bg-yellow-500' },
    { name: 'بلاتيني', required: 3500, color: 'bg-blue-500' },
    { name: 'ماسي', required: 5000, color: 'bg-purple-500' }
  ], []);
  
  // حساب المستوى الحالي وتقدم النقاط للمستوى التالي
  const calculateLevelProgress = useMemo(() => {
    const totalPoints = customer.pointsEarned;
    
    // تحديد المستوى الحالي
    const currentLevelIndex = pointLevels.findIndex(level => totalPoints < level.required);
    const currentLevel = currentLevelIndex > 0 
      ? pointLevels[currentLevelIndex - 1] 
      : { name: 'مبتدئ', required: 0, color: 'bg-gray-500' };
    
    // تحديد المستوى التالي
    const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < pointLevels.length 
      ? pointLevels[currentLevelIndex] 
      : pointLevels[pointLevels.length - 1];
    
    // حساب النسبة المئوية للتقدم نحو المستوى التالي
    const prevLevelPoints = currentLevel.required;
    const nextLevelPoints = nextLevel.required;
    const pointsNeededForNextLevel = nextLevelPoints - prevLevelPoints;
    const pointsEarnedTowardsNextLevel = totalPoints - prevLevelPoints;
    const progressPercentage = Math.min(
      Math.round((pointsEarnedTowardsNextLevel / pointsNeededForNextLevel) * 100),
      100
    );
    
    const isMaxLevel = currentLevelIndex === -1;
    
    return {
      currentLevel,
      nextLevel,
      progressPercentage: isMaxLevel ? 100 : progressPercentage,
      pointsToNextLevel: isMaxLevel ? 0 : nextLevelPoints - totalPoints,
      isMaxLevel
    };
  }, [customer.pointsEarned, pointLevels]);
  
  const { currentLevel, nextLevel, progressPercentage, pointsToNextLevel, isMaxLevel } = calculateLevelProgress;
  
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${currentLevel.color} mr-2`}></div>
          <span className="text-sm font-medium">المستوى الحالي: {currentLevel.name}</span>
        </div>
        {!isMaxLevel && (
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${nextLevel.color} mr-2`}></div>
            <span className="text-sm font-medium">المستوى التالي: {nextLevel.name}</span>
          </div>
        )}
      </div>
      <Progress
        value={progressPercentage}
        className="h-2.5"
        indicatorClassName={currentLevel.color}
      />
      {!isMaxLevel ? (
        <p className="text-xs text-muted-foreground mt-1">
          متبقي {pointsToNextLevel} نقطة للوصول للمستوى التالي
        </p>
      ) : (
        <p className="text-xs text-green-600 font-medium mt-1">
          لقد وصلت للمستوى الأعلى! 🎉
        </p>
      )}
    </div>
  );
};

export default CustomerPointsProgress;
