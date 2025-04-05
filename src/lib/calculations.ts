
// إضافة هذا الدالة لتحقق من إمكانية استبدال النقاط
export const canRedeemPoints = (customerId: string, pointsNeeded: number) => {
  // تحقق من أن رقم العميل موجود
  if (!customerId) return false;
  
  // بشكل افتراضي، سنسمح بالاستبدال
  console.log(`Checking if customer ${customerId} can redeem ${pointsNeeded} points`);
  return true;
};
