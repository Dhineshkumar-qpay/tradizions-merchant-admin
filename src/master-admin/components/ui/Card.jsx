import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Card = ({ children, className, ...props }) => {
    return (
        <div
            className={cn(
                "bg-white rounded-xl border border-border shadow-soft overflow-hidden transition-all duration-300 hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className, title, description }) => (
    <div className={cn("px-6 py-4 border-b border-border flex items-center justify-between", className)}>
        <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {children}
    </div>
);

export const CardContent = ({ children, className }) => (
    <div className={cn("p-6", className)}>
        {children}
    </div>
);

export const CardFooter = ({ children, className }) => (
    <div className={cn("px-6 py-4 border-t border-border bg-gray-50/50", className)}>
        {children}
    </div>
);

export default Card;
