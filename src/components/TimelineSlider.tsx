import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, Card, Space, Switch, Typography } from 'antd';
import { addDays, addHours, format, subDays } from 'date-fns';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import React from 'react';
import { useAppStore } from '../store/useAppStore';

const { Text, Title } = Typography;

const TimelineSlider: React.FC = () => {
  const {
    currentTime,
    timeRange,
    isRangeMode,
    setCurrentTime,
    setTimeRange,
    setRangeMode,
  } = useAppStore();

  const now = new Date();
  const startDate = subDays(now, 15);
  const endDate = addDays(now, 15);
  
  // Convert dates to timestamps for slider
  const minTimestamp = startDate.getTime();
  const maxTimestamp = endDate.getTime();
  const hourInMs = 60 * 60 * 1000;

  const currentTimestamp = currentTime.getTime();
  const rangeTimestamps = [timeRange.start.getTime(), timeRange.end.getTime()];

  const handleSingleChange = (value: number | number[]) => {
    if (typeof value === 'number') {
      setCurrentTime(new Date(value));
    }
  };

  const handleRangeChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      setTimeRange({
        start: new Date(value[0]),
        end: new Date(value[1]),
      });
    }
  };

  const formatTooltip = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM dd, HH:mm');
  };

  const marks = React.useMemo(() => {
    const marksObj: { [key: number]: string } = {};
    let current = new Date(startDate);
    
    while (current <= endDate) {
      if (current.getHours() === 0) {
        marksObj[current.getTime()] = format(current, 'MMM dd');
      }
      current = addHours(current, 24);
    }
    
    return marksObj;
  }, [startDate, endDate]);

  return (
    <Card className="mb-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Title level={4} className="mb-0">Timeline Control</Title>
          <Space>
            <Text>Range Mode:</Text>
            <Switch
              checked={isRangeMode}
              onChange={setRangeMode}
              checkedChildren="Range"
              unCheckedChildren="Single"
            />
          </Space>
        </div>

        <div className="px-4">
          {isRangeMode ? (
            <div className="space-y-2">
              <Text strong>Time Range Selection</Text>
              <Slider
                range
                min={minTimestamp}
                max={maxTimestamp}
                step={hourInMs}
                value={rangeTimestamps}
                onChange={handleRangeChange}
                marks={marks}
                tooltip={{
                  formatter: formatTooltip,
                }}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>From: {format(timeRange.start, 'MMM dd, yyyy HH:mm')}</span>
                <span>To: {format(timeRange.end, 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Text strong>Single Time Selection</Text>
              <Slider
                min={minTimestamp}
                max={maxTimestamp}
                step={hourInMs}
                value={currentTimestamp}
                onChange={handleSingleChange}
                marks={marks}
                tooltip={{
                  formatter: formatTooltip,
                }}
                className="mb-4"
              />
              <div className="text-center text-sm text-gray-600">
                Selected: {format(currentTime, 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                const newTime = addHours(currentTime, 1);
                if (newTime <= endDate) {
                  setCurrentTime(newTime);
                }
              }}
              disabled={addHours(currentTime, 1) > endDate}
            >
              Next Hour
            </Button>
            <Button
              onClick={() => setCurrentTime(now)}
            >
              Reset to Now
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default TimelineSlider;