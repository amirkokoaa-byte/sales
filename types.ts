export interface Product {
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    branchId: string;
    date: string; // YYYY-MM-DD
    items: Product[];
    totalValue: number;
    timestamp: number;
}

export interface Payment {
    id: string;
    amount: number;
    date: string;
}

export interface Invoice {
    id: string;
    branchId: string;
    invoiceNumber: string;
    totalValue: number;
    payments: Payment[];
    date: string; // YYYY-MM-DD
}

export interface Branch {
    id: string;
    name: string;
    isCustom: boolean;
}

export interface Contact {
    id: string;
    branchName: string;
    managerName: string;
    managerPhone: string;
    supervisorName: string;
}

export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    BRANCH_DETAILS = 'BRANCH_DETAILS',
    CONTACTS = 'CONTACTS'
}