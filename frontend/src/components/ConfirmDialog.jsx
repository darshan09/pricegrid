import React from 'react';
import { useTradingStore } from '../store/tradingStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { XCircle, ArrowLeftRight, Ban, DollarSign } from 'lucide-react';

const ConfirmDialog = () => {
  const { confirmDialog, closeConfirmDialog, confirmDialogAction } = useTradingStore();
  const { isOpen, type, message } = confirmDialog;
  
  const isSquareOff = type === 'SQUARE_OFF' || type === 'SQUARE_OFF_ALL';
  const isBulk = type === 'CANCEL_ALL' || type === 'SQUARE_OFF_ALL';
  
  const getTitle = () => {
    switch (type) {
      case 'CANCEL_ALL': return 'Cancel All Orders?';
      case 'SQUARE_OFF_ALL': return 'Square Off All Positions?';
      case 'SQUARE_OFF': return 'Square Off Trade?';
      default: return 'Cancel Order?';
    }
  };
  
  const getIcon = () => {
    if (type === 'CANCEL_ALL') return <Ban className="text-red-400" size={20} />;
    if (type === 'SQUARE_OFF_ALL') return <DollarSign className="text-[#E0FF66]" size={20} />;
    if (isSquareOff) return <ArrowLeftRight className="text-[#E0FF66]" size={20} />;
    return <XCircle className="text-red-400" size={20} />;
  };
  
  const getConfirmText = () => {
    if (type === 'CANCEL_ALL') return 'Yes, Cancel All';
    if (type === 'SQUARE_OFF_ALL') return 'Yes, Square Off All';
    if (isSquareOff) return 'Yes, Square Off';
    return 'Yes, Cancel';
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeConfirmDialog()}>
      <AlertDialogContent className="bg-[#120A14] border-[#3D2840] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            {getIcon()}
            {getTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#F555A2]/80">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="bg-[#3D2840] border-[#3D2840] text-white hover:bg-[#4D3850]"
            onClick={closeConfirmDialog}
          >
            No, Keep {isBulk ? 'Them' : 'It'}
          </AlertDialogCancel>
          <AlertDialogAction
            className={isSquareOff 
              ? "bg-[#E0FF66] text-black hover:bg-[#E0FF66]/90"
              : "bg-red-500 text-white hover:bg-red-600"
            }
            onClick={confirmDialogAction}
            data-testid="confirm-dialog-action"
          >
            {getConfirmText()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
