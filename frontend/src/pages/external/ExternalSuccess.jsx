import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export default function ExternalSuccess() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-8 shadow-xl">
                <div className="text-center space-y-6">
                    {/* Success Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Claim Submitted Successfully!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Thank you for submitting your examination claim.
                        </p>
                    </div>

                    {/* Information Card */}
                    <Card className="p-6 bg-blue-50 border-blue-200 text-left">
                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            What happens next?
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Your claim has been forwarded to the accountant for review</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>You will be contacted via email or phone if any clarification is needed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Payment will be processed once your claim is approved</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>Please ensure your bank details are correct to avoid payment delays</span>
                            </li>
                        </ul>
                    </Card>

                    {/* Contact Information */}
                    <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            For any queries, please contact the examination department at your institution.
                        </p>
                    </div>

                    {/* Close Button */}
                    <div className="pt-2">
                        <Button
                            onClick={() => window.close()}
                            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8"
                        >
                            Close Window
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
