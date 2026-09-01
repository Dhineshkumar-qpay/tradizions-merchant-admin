import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" /> Home
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                return (
                    <React.Fragment key={name}>
                        <ChevronRight className="w-3 h-3" />
                        {isLast ? (
                            <span className="text-gray-900 capitalize">{name.replace(/-/g, ' ')}</span>
                        ) : (
                            <Link to={routeTo} className="hover:text-primary transition-colors capitalize">
                                {name.replace(/-/g, ' ')}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
