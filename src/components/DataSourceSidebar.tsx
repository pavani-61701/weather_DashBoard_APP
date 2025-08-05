
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  ColorPicker,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography
} from 'antd';
import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ColorRule, DataSource } from '../types';
import { generateUniqueId } from '../utils/colorUtils';

const { Title, Text } = Typography;
const { Option } = Select;

const DataSourceSidebar: React.FC = () => {
  const {
    dataSources,
    selectedDataSourceId,
    polygons,
    setSelectedDataSourceId,
    updateDataSource,
    renamePolygon,
    removePolygon,
  } = useAppStore();

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ColorRule | null>(null);
  const [newRule, setNewRule] = useState<Partial<ColorRule>>({
    operator: '>=',
    value: 0,
    color: '#1890ff',
    label: '',
  });

  const currentDataSource = dataSources.find(
    (ds) => ds.id === selectedDataSourceId
  );

  const handleAddRule = () => {
    setEditingRule(null);
    setNewRule({
      operator: '>=',
      value: 0,
      color: '#1890ff',
      label: '',
    });
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: ColorRule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setShowRuleModal(true);
  };

  const handleSaveRule = () => {
    if (!currentDataSource) return;

    if (!newRule.label?.trim()) {
      message.error('Please enter a label for the rule');
      return;
    }

    if (newRule.value === undefined || newRule.value === null) {
      message.error('Please enter a value for the rule');
      return;
    }

    const ruleToSave: ColorRule = {
      id: editingRule?.id || generateUniqueId(),
      operator: newRule.operator!,
      value: newRule.value,
      color: typeof newRule.color === 'string' ? newRule.color : '#1890ff',
      label: newRule.label.trim(),
    };

    let updatedRules: ColorRule[];
    if (editingRule) {
      updatedRules = currentDataSource.colorRules.map((rule) =>
        rule.id === editingRule.id ? ruleToSave : rule
      );
    } else {
      updatedRules = [...currentDataSource.colorRules, ruleToSave];
    }

    const updatedDataSource: DataSource = {
      ...currentDataSource,
      colorRules: updatedRules,
    };

    updateDataSource(updatedDataSource);
    setShowRuleModal(false);
    message.success(`Rule ${editingRule ? 'updated' : 'added'} successfully`);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (!currentDataSource) return;

    Modal.confirm({
      title: 'Delete Color Rule',
      content: 'Are you sure you want to delete this color rule?',
      onOk: () => {
        const updatedRules = currentDataSource.colorRules.filter(
          (rule) => rule.id !== ruleId
        );
        const updatedDataSource: DataSource = {
          ...currentDataSource,
          colorRules: updatedRules,
        };
        updateDataSource(updatedDataSource);
        message.success('Color rule deleted');
      },
    });
  };

  const getOperatorSymbol = (operator: ColorRule['operator']) => {
    switch (operator) {
      case '=':
        return '=';
      case '<':
        return '<';
      case '>':
        return '>';
      case '<=':
        return '≤';
      case '>=':
        return '≥';
      default:
        return operator;
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <Card className="shadow-sm">
        <div className="space-y-4">
          <Title level={4}>Data Source Selection</Title>

          <div>
            <Text strong>Active Data Source:</Text>
            <Select
              value={selectedDataSourceId}
              onChange={setSelectedDataSourceId}
              className="w-full mt-2"
            >
              {dataSources.map((ds) => (
                <Option key={ds.id} value={ds.id}>
                  {ds.name}
                </Option>
              ))}
            </Select>
          </div>

          {currentDataSource && (
            <div>
              <Text type="secondary">Field: {currentDataSource.field}</Text>
            </div>
          )}
        </div>
      </Card>

      <Card className="shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Title level={4}>Color Rules</Title>
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAddRule}
              disabled={!currentDataSource}
            >
              Add Rule
            </Button>
          </div>

          {currentDataSource && (
            <div className="space-y-2">
              {currentDataSource.colorRules.length === 0 ? (
                <Text type="secondary">No color rules defined</Text>
              ) : (
                <List
                  size="small"
                  dataSource={currentDataSource.colorRules}
                  renderItem={(rule) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          size="small"
                          icon={<SettingOutlined />}
                          onClick={() => handleEditRule(rule)}
                        />,
                        <Button
                          key="delete"
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRule(rule.id)}
                        />,
                      ]}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: rule.color }}
                        />
                        <Text className="text-xs">
                          {getOperatorSymbol(rule.operator)} {rule.value}
                        </Text>
                        <Text type="secondary" className="text-xs">
                          {rule.label}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="shadow-sm">
        <div className="space-y-4">
          <Title level={4}>Active Polygons</Title>

          {polygons.length === 0 ? (
            <Text type="secondary">No polygons created yet</Text>
          ) : (
            <div className="space-y-2">
              {polygons.map((polygon) => (
                <div
                  key={polygon.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: polygon.color }}
                    />
                    <Input
                      size="small"
                      value={polygon.name}
                      onChange={(e) =>
                        renamePolygon(polygon.id, e.target.value)
                      }
                      style={{ width: 120 }}
                    />
                  </div>
                  <Space>
                    <Tag size="small">{polygon.coordinates.length} pts</Tag>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removePolygon(polygon.id)}
                    />
                  </Space>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        title={editingRule ? 'Edit Color Rule' : 'Add Color Rule'}
        open={showRuleModal}
        onOk={handleSaveRule}
        onCancel={() => setShowRuleModal(false)}
        okText={editingRule ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <Text strong>Condition:</Text>
            <div className="flex items-center space-x-2 mt-2">
              <Select
                value={newRule.operator}
                onChange={(value) =>
                  setNewRule({ ...newRule, operator: value })
                }
                style={{ width: 80 }}
              >
                <Option value="=">=</Option>
                <Option value="<">&lt;</Option>
                <Option value=">">&gt;</Option>
                <Option value="<=">&le;</Option>
                <Option value=">=">&ge;</Option>
              </Select>
              <InputNumber
                value={newRule.value}
                onChange={(value) =>
                  setNewRule({ ...newRule, value: value || 0 })
                }
                placeholder="Value"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div>
            <Text strong>Color:</Text>
            <ColorPicker
              value={newRule.color}
              onChange={(color) =>
                setNewRule({ ...newRule, color: color.toHexString() })
              }
              className="mt-2"
            />
          </div>

          <div>
            <Text strong>Label:</Text>
            <Input
              value={newRule.label}
              onChange={(e) =>
                setNewRule({ ...newRule, label: e.target.value })}
              placeholder="Enter a descriptive label"
              className="mt-2"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataSourceSidebar;
