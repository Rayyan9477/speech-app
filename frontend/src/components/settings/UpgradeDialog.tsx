import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useSettings } from '../../contexts/SettingsContext';
import {
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const UpgradeDialog: React.FC = () => {
  const { state, dispatch, upgradeAccount } = useSettings();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!state.showUpgradeDialog) {
    return null;
  }

  const proFeatures = [
    'Unlimited voice generation',
    'Premium AI voices',
    'Advanced voice customization',
    'Priority processing',
    'Export in multiple formats',
    'Commercial use license',
    'Premium support',
    'No watermarks'
  ];

  const handleUpgrade = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await upgradeAccount('pro');
    setIsProcessing(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => dispatch({ type: 'HIDE_UPGRADE_DIALOG' })}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          <Card className="shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500" />
                  <span>Upgrade to Pro</span>
                </h2>
                <p className="text-muted-foreground">Unlock all premium features</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => dispatch({ type: 'HIDE_UPGRADE_DIALOG' })}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Plan Toggle */}
              <div className="flex items-center justify-center">
                <div className="bg-muted rounded-lg p-1 flex">
                  <Button
                    variant={selectedPlan === 'monthly' ? 'default' : 'ghost'}
                    onClick={() => setSelectedPlan('monthly')}
                    size="sm"
                    className="px-4"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={selectedPlan === 'yearly' ? 'default' : 'ghost'}
                    onClick={() => setSelectedPlan('yearly')}
                    size="sm"
                    className="px-4 relative"
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Save 20%
                    </span>
                  </Button>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    ${selectedPlan === 'monthly' ? '9.99' : '79.99'}
                  </span>
                  <div className="text-left">
                    <div className="text-sm text-muted-foreground">
                      per {selectedPlan === 'monthly' ? 'month' : 'year'}
                    </div>
                    {selectedPlan === 'yearly' && (
                      <div className="text-xs text-green-600">
                        $6.67/month
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    Rated 4.9/5 by 1000+ users
                  </span>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">What&apos;s included:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Preview */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <div className="flex items-center space-x-3">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-foreground">Secure Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      256-bit SSL encryption • Cancel anytime • 30-day money back guarantee
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-muted/20">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'HIDE_UPGRADE_DIALOG' })}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4" />
                      <span>Upgrade Now</span>
                    </div>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                By upgrading, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeDialog;