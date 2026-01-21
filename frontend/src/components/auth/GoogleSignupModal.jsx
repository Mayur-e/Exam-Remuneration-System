import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

const DEPARTMENTS = [
    'Computer',
    'Information Technology',
    'Electronics & Telecommunication',
    'Electrical',
    'Mechanical',
    'Civil',
    'Artificial Intelligence & Data Science',
    'Other'
];

export default function GoogleSignupModal({ isOpen, onClose, email, name, onSubmit, isLoading }) {
    const [prn, setPrn] = useState('');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!prn.trim()) {
            setError('PRN is required');
            return;
        }

        if (!department) {
            setError('Please select a department');
            return;
        }

        onSubmit({ prn: prn.trim(), department });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Complete Your Registration</h2>
                        <p className="text-sm text-gray-600">
                            Welcome, <span className="font-semibold">{name}</span>
                        </p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* PRN Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                PRN (Permanent Registration Number) <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter your PRN"
                                value={prn}
                                onChange={(e) => {
                                    setPrn(e.target.value);
                                    setError('');
                                }}
                                className="focus:border-blue-500 focus:ring-blue-500"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Department Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={department}
                                onChange={(e) => {
                                    setDepartment(e.target.value);
                                    setError('');
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                                disabled={isLoading}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Registering...
                                    </span>
                                ) : (
                                    'Complete Registration'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
