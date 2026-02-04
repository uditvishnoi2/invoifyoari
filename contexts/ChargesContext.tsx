"use client";

import React, {
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

// RHF
import { useFormContext, useWatch } from "react-hook-form";

// Helpers
import { formatPriceToString } from "@/lib/helpers";

// Types
import { InvoiceType, ItemType } from "@/types";

const defaultChargesContext = {
    discountSwitch: false,
    setDiscountSwitch: (newValue: boolean) => {},
    taxSwitch: false,
    setTaxSwitch: (newValue: boolean) => {},
    shippingSwitch: false,
    setShippingSwitch: (newValue: boolean) => {},
    cgstSwitch: false,
    setCgstSwitch: (newValue: boolean) => {},
    igstSwitch: false,
    setIgstSwitch: (newValue: boolean) => {},
    sgstSwitch: false,
    setSgstSwitch: (newValue: boolean) => {},
    cgstType: "amount",
    setCgstType: (newValue: SetStateAction<string>) => {},
    igstType: "amount",
    setIgstType: (newValue: SetStateAction<string>) => {},
    sgstType: "amount",
    setSgstType: (newValue: SetStateAction<string>) => {},
    discountType: "amount",
    setDiscountType: (newValue: SetStateAction<string>) => {},
    taxType: "amount",
    setTaxType: (newValue: SetStateAction<string>) => {},
    shippingType: "amount",
    setShippingType: (newValue: SetStateAction<string>) => {},
    totalInWordsSwitch: true,
    setTotalInWordsSwitch: (newValue: boolean) => {},
    currency: "USD",
    subTotal: 0,
    totalAmount: 0,
    calculateTotal: () => {},
};

export const ChargesContext = createContext(defaultChargesContext);

export const useChargesContext = () => {
    return useContext(ChargesContext);
};

type ChargesContextProps = {
    children: React.ReactNode;
};

export const ChargesContextProvider = ({ children }: ChargesContextProps) => {
    const { control, setValue, getValues } = useFormContext<InvoiceType>();

    // Form Fields
    const itemsArray = useWatch({
        name: `details.items`,
        control,
    });

    const currency = useWatch({
        name: `details.currency`,
        control,
    });

    // Charges
    const charges = {
        cgst: useWatch({ name: `details.cgstDetails`, control }) || {
            amount: 0,
            amountType: "amount",
        },
        igst: useWatch({ name: `details.igstDetails`, control }) || {
            amount: 0,
            amountType: "amount",
        },
        sgst: useWatch({ name: `details.sgstDetails`, control }) || {
            amount: 0,
            amountType: "amount",
        },
        discount: useWatch({ name: `details.discountDetails`, control }) || {
            amount: 0,
            amountType: "amount",
        },
        tax: useWatch({ name: `details.taxDetails`, control }) || {
            amount: 0,
            amountType: "amount",
        },
        shipping: useWatch({ name: `details.shippingDetails`, control }) || {
            cost: 0,
            costType: "amount",
        },
    };

    const { discount, tax, shipping, cgst, igst, sgst } = charges;

    // Switch states. On/Off
    const [discountSwitch, setDiscountSwitch] = useState<boolean>(
        discount?.amount ? true : false
    );
    const [taxSwitch, setTaxSwitch] = useState<boolean>(
        tax?.amount ? true : false
    );
    const [shippingSwitch, setShippingSwitch] = useState<boolean>(
        shipping?.cost ? true : false
    );
    const [cgstSwitch, setCgstSwitch] = useState<boolean>(
        cgst?.amount ? true : false
    );
    const [igstSwitch, setIgstSwitch] = useState<boolean>(
        igst?.amount ? true : false
    );
    const [sgstSwitch, setSgstSwitch] = useState<boolean>(
        sgst?.amount ? true : false
    );

    // ? Old approach of using totalInWords variable
    // totalInWords ? true : false
    const [totalInWordsSwitch, setTotalInWordsSwitch] = useState<boolean>(true);

    // Initial subtotal and total
    const [subTotal, setSubTotal] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(0);

    // Types for discount, tax, and shipping. Amount | Percentage
    const [discountType, setDiscountType] = useState("amount");
    const [taxType, setTaxType] = useState("amount");
    const [shippingType, setShippingType] = useState("amount");
    const [cgstType, setCgstType] = useState("amount");
    const [igstType, setIgstType] = useState("amount");
    const [sgstType, setSgstType] = useState("amount");

    // When loading invoice, if received values, turn on the switches
    useEffect(() => {
        if (discount?.amount) {
            setDiscountSwitch(true);
        }

        if (tax?.amount) {
            setTaxSwitch(true);
        }

        if (shipping?.cost) {
            setShippingSwitch(true);
        }
        
        if (cgst?.amount) {
            setCgstSwitch(true);
        }

        if (igst?.amount) {
            setIgstSwitch(true);
        }

        if (sgst?.amount) {
            setSgstSwitch(true);
        }

        if (discount?.amountType == "amount") {
            setDiscountType("amount");
        } else {
            setDiscountType("percentage");
        }

        if (tax?.amountType == "amount") {
            setTaxType("amount");
        } else {
            setTaxType("percentage");
        }

        if (shipping?.costType == "amount") {
            setShippingType("amount");
        } else {
            setShippingType("percentage");
        }

        if (cgst?.amountType == "amount") {
            setCgstType("amount");
        } else {
            setCgstType("percentage");
        }

        if (igst?.amountType == "amount") {
            setIgstType("amount");
        } else {
            setIgstType("percentage");
        }

        if (sgst?.amountType == "amount") {
            setSgstType("amount");
        } else {
            setSgstType("percentage");
        }
    }, [discount?.amount, tax?.amount, shipping?.cost, cgst?.amount, igst?.amount, sgst?.amount]);

    // Check switches, if off set values to zero
    useEffect(() => {
        if (!discountSwitch) {
            setValue("details.discountDetails.amount", 0);
        }

        if (!taxSwitch) {
            setValue("details.taxDetails.amount", 0);
        }

        if (!shippingSwitch) {
            setValue("details.shippingDetails.cost", 0);
        }

        if (!cgstSwitch) {
            setValue("details.cgstDetails.amount", 0);
        }

        if (!igstSwitch) {
            setValue("details.igstDetails.amount", 0);
        }
        
        if (!sgstSwitch) {
            setValue("details.sgstDetails.amount", 0);
        }

    }, [discountSwitch, taxSwitch, shippingSwitch,cgstSwitch, igstSwitch, sgstSwitch]);

    // Calculate total when values change
    useEffect(() => {
        calculateTotal();
    }, [
        itemsArray,
        totalInWordsSwitch,
        discountType,
        discount?.amount,
        taxType,
        tax?.amount,
        shippingType,
        shipping?.cost,
        currency,
        cgstType,
        cgst?.amount,
        igstType,
        igst?.amount,
        sgstType,
        sgst?.amount,
    ]);

    /**
     * Calculates the subtotal, total, and the total amount in words on the invoice.
     */
    const calculateTotal = () => {
        // Here Number(item.total) fixes a bug where an extra zero appears
        // at the beginning of subTotal caused by toFixed(2) in item.total in single item
        // Reason: toFixed(2) returns string, not a number instance
        const totalSum: number = itemsArray.reduce(
            (sum: number, item: ItemType) => sum + Number(item.total),
            0
        );

        setValue("details.subTotal", totalSum);
        setSubTotal(totalSum);

        let discountAmount: number =
            parseFloat(discount!.amount.toString()) ?? 0;
        let taxAmount: number = parseFloat(tax!.amount.toString()) ?? 0;
        let shippingCost: number = parseFloat(shipping!.cost.toString()) ?? 0;
        let cgstAmount: number = parseFloat(cgst!.amount.toString()) ?? 0;
        let igstAmount: number = parseFloat(igst!.amount.toString()) ?? 0;
        let sgstAmount: number = parseFloat(sgst!.amount.toString()) ?? 0;

        let discountAmountType: string = "amount";
        let taxAmountType: string = "amount";
        let cgstAmountType: string = "amount";
        let igstAmountType: string = "amount";
        let sgstAmountType: string = "amount";
        let shippingCostType: string = "amount";

        let total: number = totalSum;

        if (!isNaN(discountAmount)) {
            if (discountType == "amount") {
                total -= discountAmount;
                discountAmountType = "amount";
            } else {
                total -= total * (discountAmount / 100);
                discountAmountType = "percentage";
            }
            setValue("details.discountDetails.amount", discountAmount);
        }

        if (!isNaN(cgstAmount)) {
            if (cgstType == "amount") {
                total += cgstAmount;
                cgstAmountType = "amount";
            } else {
                total += totalSum * (cgstAmount / 100);
                cgstAmountType = "percentage";
            }
            setValue("details.cgstDetails.amount", cgstAmount);
        }

         if (!isNaN(igstAmount)) {
            if (igstType == "amount") {
                total += igstAmount;
                igstAmountType = "amount";
            } else {
                total += totalSum * (igstAmount / 100);
                igstAmountType = "percentage";
            }
            setValue("details.igstDetails.amount", igstAmount);
        }

        if (!isNaN(sgstAmount)) {
            if (sgstType == "amount") {
                total += sgstAmount;
                sgstAmountType = "amount";
            } else {
                total += totalSum * (sgstAmount / 100);
                sgstAmountType = "percentage";
            }
            setValue("details.sgstDetails.amount", sgstAmount);
        }

        // if (!isNaN(taxAmount)) {
        //     if (taxType == "amount") {
        //         total += taxAmount;
        //         taxAmountType = "amount";
        //     } else {
        //         total += total * (taxAmount / 100);
        //         taxAmountType = "percentage";
        //     }
        //     setValue("details.taxDetails.amount", taxAmount);
        // }

        if (!isNaN(shippingCost)) {
            if (shippingType == "amount") {
                total += shippingCost;
                shippingCostType = "amount";
            } else {
                total += total * (shippingCost / 100);
                shippingCostType = "percentage";
            }
            setValue("details.shippingDetails.cost", shippingCost);
        }

        setTotalAmount(total);

        setValue("details.discountDetails.amountType", discountAmountType);
        setValue("details.taxDetails.amountType", taxAmountType);
        setValue("details.shippingDetails.costType", shippingCostType);
        setValue("details.cgstDetails.amountType", cgstAmountType);
        setValue("details.igstDetails.amountType", igstAmountType);
        setValue("details.sgstDetails.amountType", sgstAmountType);

        setValue("details.totalAmount", total);
        
        if (totalInWordsSwitch) {
            setValue("details.totalAmountInWords", formatPriceToString(total, getValues("details.currency")));
        } else {
            setValue("details.totalAmountInWords", "");
        }
    };

    return (
        <ChargesContext.Provider
            value={{
                discountSwitch,
                setDiscountSwitch,
                taxSwitch,
                setTaxSwitch,
                shippingSwitch,
                setShippingSwitch,
                cgstSwitch,
                setCgstSwitch,
                igstSwitch,
                setIgstSwitch,
                sgstSwitch,
                setSgstSwitch,
                cgstType,
                setCgstType,
                igstType,
                setIgstType,
                sgstType,
                setSgstType,
                discountType,
                setDiscountType,
                taxType,
                setTaxType,
                shippingType,
                setShippingType,
                totalInWordsSwitch,
                setTotalInWordsSwitch,
                currency,
                subTotal,
                totalAmount,
                calculateTotal,
            }}
        >
            {children}
        </ChargesContext.Provider>
    );
};
