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
import { XCircle, ArrowLeftRight } from 'lucide-react';

const ConfirmDialog = () => {
  const { confirmDialog, closeConfirmDialog, confirmDialogAction } = useTradingStore();
  const { isOpen, type, message } = confirmDialog;
  
  const isSquareOff = type === 'SQUARE_OFF';
  
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeConfirmDialog()}>
      <AlertDialogContent className="bg-[#120A14] border-[#3D2840] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            {isSquareOff ? (
              <>
                <ArrowLeftRight className="text-[#E0FF66]" size={20} />
                Square Off Trade?
              </>
            ) : (
              <>
                <XCircle className="text-red-400" size={20} />
                Cancel Order?
              </>
            )}
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
            No, Keep It
          </AlertDialogCancel>
          <AlertDialogAction
            className={isSquareOff 
              ? "bg-[#E0FF66] text-black hover:bg-[#E0FF66]/90"
              : "bg-red-500 text-white hover:bg-red-600"
            }
            onClick={confirmDialogAction}
            data-testid="confirm-dialog-action"
          >
            {isSquareOff ? 'Yes, Square Off' : 'Yes, Cancel'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
