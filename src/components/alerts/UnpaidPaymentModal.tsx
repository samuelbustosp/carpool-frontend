'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, Printer, X, AlertCircle, Star } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { NotificationType } from '@/shared/types/notification';
import { payReservation } from '@/services/reservation/reservationService'; 
import { useAuth } from '@/contexts/authContext'; 
import { AlertDialog } from '../ux/AlertDialog';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/shared/utils/number';
import { downloadPaymentReceipt } from '@/services/reservation/reservationService';

export const UnpaidPaymentModal = () => {
  const { unpaidNotification, clearNotification } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { fetchUserDebt, fetchUserImage} = useAuth();

  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false);

  // Agregar estilos de impresión - DEBE estar antes del early return
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          margin: 2cm;
          size: A4;
        }
        
        body * {
          visibility: hidden;
        }
        
        #print-content, #print-content * {
          visibility: visible;
        }
        
        #print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white !important;
          color: black !important;
        }
        
        .print-header {
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .print-title {
          font-size: 32px !important;
          font-weight: bold;
          color: #000 !important;
          margin: 0;
        }
        
        .print-subtitle {
          font-size: 14px !important;
          color: #666 !important;
          margin-top: 5px;
        }
        
        .print-section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        
        .print-section-title {
          font-size: 18px !important;
          font-weight: bold;
          color: #000 !important;
          margin-bottom: 15px;
          border-bottom: 2px solid #eee;
          padding-bottom: 8px;
        }
        
        .print-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .print-label {
          font-size: 14px !important;
          color: #666 !important;
          font-weight: 500;
        }
        
        .print-value {
          font-size: 14px !important;
          color: #000 !important;
          font-weight: 600;
          text-align: right;
        }
        
        .print-status {
          background: #dcfce7 !important;
          color: #166534 !important;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-size: 16px !important;
          font-weight: bold;
          margin-top: 30px;
          border: 2px solid #86efac;
        }
        
        .print-footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          font-size: 11px !important;
          color: #999 !important;
          text-align: center;
        }
        
        .print-logo {
          width: 60px;
          height: 60px;
          background: #000;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Solo mostrar si es una notificación de pago pendiente
  if (!unpaidNotification || unpaidNotification.type !== NotificationType.PAYMENT_PENDING) {
    return null;
  }

  const handleConfirmPay = async () => {
    if (isProcessing) return;

    setConfirmDialogOpen(false);
    setIsProcessing(true);

    try {
      const response = await payReservation();

      if (response.state === "ERROR") {
        setPaymentError(response.messages?.[0] || "Error al procesar el pago");
        setIsErrorDialogOpen(true);
        return;
      }


      await fetchUserDebt();
      await fetchUserImage();

      setShowSuccess(true);
    } catch{
      setPaymentError("Error inesperado al procesar el pago");
      setIsErrorDialogOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    if (!unpaidNotification.data?.reservationId || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadPaymentReceipt(unpaidNotification.data.reservationId);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    clearNotification();
  };

  const handleGoToReview = () => {
    router.push(`/driver-review/trip/${unpaidNotification.data?.tripId}`); 
    handleCloseSuccess()
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      {!showSuccess ? (
        <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-md overflow-hidden border border-gray-800">
          {/* Header con ícono */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {unpaidNotification.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {unpaidNotification.message}
                </p>
              </div>
            </div>
          </div>

          {/* Resumen del pago */}
          <div className="px-6 pb-6">
            <div className="bg-[#252525] rounded-2xl p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-400 text-sm">Estado</span>
                  <span className="text-red-400 text-sm font-medium">
                    Pendiente
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400 text-sm">Total a pagar</span>
                <span className="text-white text-sm font-semibold">
                  ARS ${' '}{formatPrice(unpaidNotification.data?.total ?? 0)}
                </span>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Acción requerida</span>
                  <span className="text-white text-sm">
                    Pago inmediato
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de pago */}
            <button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={isProcessing}
              className={`
                w-full mt-6 font-semibold py-4 rounded-2xl
                transition-all duration-200
                flex items-center justify-center gap-3
                cursor-pointer
                ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 text-black'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando pago…</span>
                </>
              ) : (
                'Pagar ahora'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-md overflow-hidden border border-gray-800">
          {/* Header de éxito */}
          <div className="p-6 pb-4 relative no-print">
            <button
              onClick={handleCloseSuccess}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#252525] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="flex items-start gap-4 pr-12">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Pago exitoso
                </h2>
                <p className="text-gray-400 text-sm">
                  Tu transacción se completó correctamente
                </p>
              </div>
            </div>
          </div>

          {/* Comprobante */}
          <div className="px-6 pb-6" id="print-content">
            {/* Header para impresión */}
            <div className="hidden print:block print-header">
              <div className="print-logo">C</div>
              <h1 className="print-title">Comprobante de Pago</h1>
              <p className="print-subtitle">Transacción aprobada exitosamente</p>
            </div>

            <div className="bg-[#252525] rounded-2xl p-5 space-y-4 print:bg-white print:rounded-none print:p-0">
              <div className="text-center pb-3 border-b border-gray-700 print:hidden">
                <h3 className="text-white font-semibold">Comprobante de pago</h3>
              </div>
              
              {/* Información de la transacción */}
              <div className="space-y-3 print:space-y-0">
                <div className="hidden print:block print-section">
                  <h2 className="print-section-title">Información de la Transacción</h2>
                </div>

                <div className="flex justify-between items-center print:print-row">
                  <span className="text-gray-400 text-sm print:print-label">Fecha</span>
                  <span className="text-white text-sm font-medium print:print-value">
                    {new Date().toLocaleDateString('es-AR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center print:print-row">
                  <span className="text-gray-400 text-sm print:print-label">Hora</span>
                  <span className="text-white text-sm font-medium print:print-value">
                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center print:print-row">
                  <span className="text-gray-400 text-sm print:print-label">ID Transacción</span>
                  <span className="text-white text-sm font-mono print:print-value">
                    TXN-{Date.now().toString().slice(-8)}
                  </span>
                </div>
                
                <div className="pt-4 border-t border-gray-700 print:border-none print:mt-6 print:pt-0">
                  <div className="hidden print:block print-section">
                    <h2 className="print-section-title">Estado del Pago</h2>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-green-500 print:print-status">
                    <CheckCircle className="w-5 h-5 print:hidden" />
                    <span className="font-semibold text-sm print:text-base">PAGO APROBADO</span>
                  </div>
                </div>
              </div>

              {/* Footer para impresión */}
              <div className="hidden print:block print-footer">
                <p>Este comprobante es válido como constancia de pago.</p>
                <p>Documento generado el {new Date().toLocaleDateString('es-AR')} a las {new Date().toLocaleTimeString('es-AR')}</p>
              </div>
            </div>

            {/* Botón imprimir */}
            <button
              onClick={handlePrint}
              disabled={isDownloading}
              className="w-full mt-6 bg-[#252525] hover:bg-[#2a2a2a] text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 no-print cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generando comprobante…</span>
                </>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  Imprimir comprobante
                </>
              )}
            </button>

            <button
              onClick={handleGoToReview}
              className="w-full mt-3 bg-[#1f2937] hover:bg-[#273449] text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 no-print"
            >
              <Star className="w-5 h-5 text-yellow-400" />
              Reseñar al conductor
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmPay}
        type="info"
        title="Confirmar pago"
        description={`Vas a pagar ARS ${formatPrice(unpaidNotification.data?.total ?? 0)}. ¿Deseás continuar?`}
        confirmText="Pagar"
        cancelText="Cancelar"
      />

      {paymentError && (
        <AlertDialog
          isOpen={isErrorDialogOpen}
          onClose={() => setIsErrorDialogOpen(false)}
          type="error"
          title="Error en el pago"
          description={paymentError}
          confirmText="Aceptar"
          singleButton
        />
      )}
    </div>
  );
};