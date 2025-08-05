import { CloudOutlined } from '@ant-design/icons';
import { Col, Layout, Row, Spin, Typography } from 'antd';
import 'leaflet-draw/dist/leaflet.draw.css';
import DataSourceSidebar from './components/DataSourceSidebar';
import MapComponent from './components/MapComponent';
import TimelineSlider from './components/TimelineSlider';
import { usePolygonData } from './hooks/usePolygonData';
import { useAppStore } from './store/useAppStore';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const { isLoading } = useAppStore();
  
  // Initialize polygon data fetching
  usePolygonData();

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <CloudOutlined className="text-2xl text-blue-500" />
          <Title level={3} className="mb-0 text-gray-800">
            Weather Data Dashboard
          </Title>
        </div>
      </Header>
      
      <Layout>
        <Sider width={350} className="bg-white shadow-sm">
          <div className="p-4 h-full">
            <DataSourceSidebar />
          </div>
        </Sider>
        
        <Layout>
          <Content className="p-6 bg-gray-50">
            <div className="space-y-6">
              <TimelineSlider />
              
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <div className="relative">
                    {isLoading && (
                      <div className="absolute top-4 right-4 z-50">
                        <Spin size="small" />
                      </div>
                    )}
                    <MapComponent />
                  </div>
                </Col>
              </Row>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;