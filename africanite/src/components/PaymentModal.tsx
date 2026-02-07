import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { mokoPaymentService, MobileMoneyProvider } from "../services/mokoPaymentService";
import "../styles/PaymentModal.css";

interface PaymentModalProps {
    show: boolean;
    onHide: () => void;
    amount: number;
    onPaymentSuccess: () => void;
}

interface ProviderInfo {
    id: MobileMoneyProvider;
    name: string;
    logo: string;
}

const PROVIDERS: ProviderInfo[] = [
    { id: "mpesa", name: "Vodacom M-Pesa", logo: "/images/money-transfer/m-pesa.png" },
    { id: "orange", name: "Orange Money", logo: "/images/money-transfer/orange-money.png" },
    { id: "airtel", name: "Airtel Money", logo: "/images/money-transfer/airtal-money.png" },
    { id: "afrimoney", name: "Africell Money", logo: "/images/money-transfer/afrimoney.png" },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
    show,
    onHide,
    amount,
    onPaymentSuccess,
}) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [provider, setProvider] = useState<MobileMoneyProvider | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressMessage, setProgressMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    useEffect(() => {
        if (phoneNumber.length >= 10) {
            const detected = mokoPaymentService.detectProvider(phoneNumber);
            setProvider(detected);
            
            // Validate phone number
            const validation = mokoPaymentService.validatePhoneNumber(phoneNumber);
            if (!validation.valid) {
                setPhoneError(validation.message || "Numéro invalide");
            } else {
                setPhoneError(null);
            }
        } else {
            setProvider(null);
            setPhoneError(null);
        }
    }, [phoneNumber]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
        setPhoneNumber(value);
        setError(null);
    };

    const handlePayment = async () => {
        setError(null);
        
        const validation = mokoPaymentService.validatePhoneNumber(phoneNumber);
        if (!validation.valid) {
            setError(validation.message || "Numéro de téléphone invalide");
            return;
        }

        setIsProcessing(true);
        setProgressMessage("Initialisation du paiement...");

        try {
            const response = await mokoPaymentService.initiatePayment({
                amount: amount,
                phoneNumber: phoneNumber,
                currency: "USD",
                userInfo: {
                    firstname: "Africanite",
                    lastname: "Service",
                    email: "info@africaniteservices.com",
                },
            });

            console.log("✅ Payment initiated:", response);
            setProgressMessage("📱 Vérifiez votre téléphone...");

            // Poll for payment status
            const cleanup = mokoPaymentService.pollPaymentStatus(
                response.transaction_id,
                (status, details) => {
                    if (status === "SUCCESS") {
                        setProgressMessage("✅ Paiement réussi!");
                        setTimeout(() => {
                            onPaymentSuccess();
                            setIsProcessing(false);
                            setProgressMessage("");
                        }, 1000);
                    } else if (status === "FAILED") {
                        setProgressMessage("");
                        setError("Le paiement a échoué. Veuillez réessayer.");
                        setIsProcessing(false);
                    }
                },
                (message) => {
                    setProgressMessage(message);
                }
            );

            // Cleanup on unmount
            return () => cleanup();
        } catch (error: any) {
            console.error("Payment error:", error);
            setError(error.message || "Erreur de paiement. Veuillez réessayer.");
            setIsProcessing(false);
            setProgressMessage("");
        }
    };

    const getProviderLogo = () => {
        if (!provider) return null;
        const providerInfo = PROVIDERS.find((p) => p.id === provider);
        return providerInfo ? providerInfo.logo : null;
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop={isProcessing ? "static" : true} keyboard={!isProcessing}>
            <Modal.Header closeButton={!isProcessing}>
                <Modal.Title>Paiement Sécurisé</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="payment-summary mb-4">
                    <h5>Résumé</h5>
                    <div className="d-flex justify-content-between">
                        <span>Génération de QR Code Premium</span>
                        <strong>${amount.toFixed(2)}</strong>
                    </div>
                </div>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Numéro de téléphone Mobile Money{" "}
                            <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="243XXXXXXXXX"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            disabled={isProcessing}
                            isInvalid={!!phoneError && phoneNumber.length >= 10}
                            isValid={!phoneError && phoneNumber.length >= 12 && provider !== null}
                            maxLength={12}
                        />
                        {phoneError && phoneNumber.length >= 10 ? (
                            <Form.Control.Feedback type="invalid">
                                {phoneError}
                            </Form.Control.Feedback>
                        ) : (
                            <Form.Text className="text-muted">
                                Format: 243 suivi de 9 chiffres (ex: 243828812498)
                            </Form.Text>
                        )}
                    </Form.Group>

                    {provider && getProviderLogo() && (
                        <div className="provider-detected mb-3">
                            <div className="d-flex align-items-center">
                                <img
                                    src={getProviderLogo()!}
                                    alt={mokoPaymentService.getProviderName(provider)}
                                    className="provider-logo"
                                    onError={(e) => {
                                        console.error('Failed to load provider logo:', getProviderLogo());
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                                <div className="ms-3">
                                    <strong>Fournisseur détecté</strong>
                                    <p className="mb-0 text-muted">
                                        {mokoPaymentService.getProviderName(provider)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
                            <strong>❌ Erreur:</strong> {error}
                        </Alert>
                    )}

                    {isProcessing && progressMessage && (
                        <Alert variant="info" className="mb-3">
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" size="sm" className="me-2" />
                                <span>{progressMessage}</span>
                            </div>
                        </Alert>
                    )}

                    {!isProcessing && (
                        <>
                            <Alert variant="warning" className="mb-3">
                                <small>
                                    💡 Vous recevrez un prompt sur votre téléphone pour
                                    confirmer le paiement.
                                </small>
                            </Alert>
                            <Alert variant="info" className="mb-3">
                                <small>
                                    ℹ️ <strong>Note:</strong> Le service de paiement est actuellement en mode test. Si vous rencontrez des erreurs, veuillez contacter le support.
                                </small>
                            </Alert>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide} disabled={isProcessing}>
                    Annuler
                </Button>
                <Button
                    variant="primary"
                    onClick={handlePayment}
                    disabled={isProcessing || !phoneNumber || !provider || !!phoneError}
                >
                    {isProcessing ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Traitement...
                        </>
                    ) : (
                        `Payer $${amount.toFixed(2)}`
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
