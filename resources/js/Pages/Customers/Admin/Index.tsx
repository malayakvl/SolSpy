import React from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: {
        name: string;
    }[];
}

interface CustomersAdminIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CustomersAdminIndex({ users }: CustomersAdminIndexProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getUserRoles = (user: User) => {
        return user.roles.map(role => role.name).join(', ') || 'User';
    };

    return (
        <AuthenticatedLayout header={<Head title="Customers" />}>
            <Head title="Customers" />
            
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Customers</h2>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 admin-table">
                            <thead className="bg-transparent">
                                <tr>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Roles
                                    </th>
                                    <th>
                                        Joined
                                    </th>
                                    <th>
                                        &nbsp;
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            {user.id}
                                        </td>
                                        <td>
                                            {user.name}
                                        </td>
                                        <td>
                                            {user.email}
                                        </td>
                                        <td>
                                            {getUserRoles(user)}
                                        </td>
                                        <td>
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td>
                                            <a
                                              href={`/login-as/${user.id}`}
                                              className="btn btn-admin-login text-purple-500 hover:underline text-sm"
                                            >
                                                Login
                                            </a>
                                        </td> 
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex space-x-1">
                                {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                    <a
                                      key={page}
                                      href={route('admin.customers.index', { page })}
                                      className={`px-3 py-2 text-sm rounded ${
                                            page === users.current_page
                                                ? 'bg-[#703ea2] text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {page}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No results message */}
                    {users.data.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No customers found.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}