import React from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';

interface PaymentActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const PaymentActionsMenu: React.FC<PaymentActionsMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent">
          <MoreVertical className="h-5 w-5" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit} className="gap-2">
          <Pencil className="h-4 w-4 text-blue-600" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-red-600">
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PaymentActionsMenu;
