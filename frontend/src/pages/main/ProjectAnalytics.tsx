import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useTheme } from '../../lib/theme-provider';
import {
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  PlayIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ChartBarIcon as ChartLineUpIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const ProjectAnalytics = () => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const analytics = {
    overview: {
      totalViews: 1247,
      totalPlays: 892,
      totalDownloads: 156,
      avgDuration: '2:34',
      engagement: 71.2
    },
    performance: {
      viewsGrowth: 12.5,
      playsGrowth: 8.3,
      downloadsGrowth: -2.1,
      engagementGrowth: 15.7
    },
    audience: {
      topCountries: [
        { country: 'United States', percentage: 34.2, flag: '🇺🇸' },
        { country: 'United Kingdom', percentage: 18.7, flag: '🇬🇧' },
        { country: 'Canada', percentage: 12.3, flag: '🇨🇦' },
        { country: 'Germany', percentage: 8.9, flag: '🇩🇪' },
        { country: 'Australia', percentage: 6.5, flag: '🇦🇺' }
      ],
      deviceTypes: [
        { device: 'Mobile', percentage: 58.3 },
        { device: 'Desktop', percentage: 32.7 },
        { device: 'Tablet', percentage: 9.0 }
      ]
    },
    content: {
      topProjects: [
        {
          title: 'Product Demo Script',
          views: 456,
          plays: 324,
          downloads: 67,
          engagement: 85.2,
          trend: 'up'
        },
        {
          title: 'Marketing Video Voiceover',
          views: 389,
          plays: 278,
          downloads: 45,
          engagement: 78.9,
          trend: 'up'
        },
        {
          title: 'Tutorial Narration',
          views: 234,
          plays: 156,
          downloads: 23,
          engagement: 72.1,
          trend: 'down'
        }
      ]
    },
    timeline: [
      { date: '2024-01-15', views: 45, plays: 32, downloads: 8 },
      { date: '2024-01-16', views: 52, plays: 38, downloads: 12 },
      { date: '2024-01-17', views: 48, plays: 35, downloads: 9 },
      { date: '2024-01-18', views: 67, plays: 49, downloads: 15 },
      { date: '2024-01-19', views: 73, plays: 52, downloads: 18 },
      { date: '2024-01-20', views: 89, plays: 64, downloads: 22 },
      { date: '2024-01-21', views: 95, plays: 68, downloads: 25 }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your project performance</p>
          </div>
          <div className="flex space-x-2">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' }
            ].map((period) => (
              <Button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                variant={selectedPeriod === period.id ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <EyeIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-foreground">Total Views</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.totalViews.toLocaleString()}</div>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpIcon className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+{analytics.performance.viewsGrowth}%</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <PlayIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-foreground">Total Plays</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.totalPlays.toLocaleString()}</div>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpIcon className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+{analytics.performance.playsGrowth}%</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DownloadIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-foreground">Downloads</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.totalDownloads}</div>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowDownIcon className="w-3 h-3 text-red-600" />
                <span className="text-xs text-red-600">{analytics.performance.downloadsGrowth}%</span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ChartLineUpIcon className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-foreground">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{analytics.overview.engagement}%</div>
              <div className="flex items-center space-x-1 mt-1">
                <ArrowUpIcon className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">+{analytics.performance.engagementGrowth}%</span>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Audience Insights */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Audience Insights</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Top Countries */}
              <div>
                <h3 className="font-medium text-foreground mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {analytics.audience.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-sm text-foreground">{country.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-10 text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Types */}
              <div>
                <h3 className="font-medium text-foreground mb-4">Device Types</h3>
                <div className="space-y-4">
                  {analytics.audience.deviceTypes.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{device.device}</span>
                        <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Content Performance */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Content Performance</h2>

            <div className="space-y-4">
              {analytics.content.topProjects.map((project, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">{project.title}</h3>
                    <div className="flex items-center space-x-1">
                      {project.trend === 'up' ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 text-red-600" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {project.engagement}% engagement
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-foreground">{project.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">{project.plays}</div>
                      <div className="text-xs text-muted-foreground">Plays</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-foreground">{project.downloads}</div>
                      <div className="text-xs text-muted-foreground">Downloads</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Performance Timeline</h2>

            <div className="space-y-4">
              {/* Simple chart visualization */}
              <div className="h-32 flex items-end justify-between space-x-2">
                {analytics.timeline.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <motion.div
                      className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t"
                      style={{
                        height: `${(day.views / 100) * 100}%`,
                        minHeight: '8px'
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.views / 100) * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                    <span className="text-xs text-muted-foreground mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary/60 rounded-full" />
                  <span className="text-muted-foreground">Plays</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Export & Actions */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Export & Actions</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-12">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="h-12">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share Analytics
              </Button>
              <Button variant="outline" className="h-12">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="outline" className="h-12">
                <UsersIcon className="w-4 h-4 mr-2" />
                Team Insights
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProjectAnalytics;
