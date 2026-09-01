import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Badge = ({ children, variant = 'gray', className }) => {
    const variants = {
        primary: 'bg-primary/10 text-primary-dark border-primary/20',
        accent: 'bg-accent/10 text-accent border-accent/20',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border-rose-100',
        gray: 'bg-gray-50 text-gray-700 border-gray-200',
        // Payment badges
        'payment-paid': 'bg-[#e8f8f0] text-[#1e8449] border-transparent',
        'payment-pending': 'bg-[#fff9e6] text-[#b7950b] border-transparent',
        'payment-failed': 'bg-[#fff1f1] text-[#a93226] border-transparent',
        // Status badges
        'status-delivered': 'bg-[#D1FAE5] text-[#10B981] border-[#10B981]',
        'status-confirmed': 'bg-[#DBEAFE] text-[#3B82F6] border-[#3B82F6]',
        'status-pending': 'bg-[#FEF3C7] text-[#F59E0B] border-[#F59E0B]',
        'status-shipped': 'bg-[#EDE9FE] text-[#8B5CF6] border-[#8B5CF6]',
        'status-cancelled': 'bg-[#FEE2E2] text-[#EF4444] border-[#EF4444]',
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export default Badge;
