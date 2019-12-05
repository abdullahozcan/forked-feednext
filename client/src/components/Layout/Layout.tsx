import React from 'react'
import { HeaderComponent } from '../Header/Header'
import { FooterComponent } from '../Footer/Footer'
import { SiderComponent } from '../Sider/Sider'
import { Layout } from 'antd'

const { Content } = Layout

export const LayoutComponent: React.FunctionComponent = props =>
    <Layout style={{ minHeight: '100vh' }}>
        <HeaderComponent/>
        <Layout>
            <SiderComponent/>
            <Content
                style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                }}
            >
                {props.children}
            </Content>
        </Layout>
        <FooterComponent/>
    </Layout>