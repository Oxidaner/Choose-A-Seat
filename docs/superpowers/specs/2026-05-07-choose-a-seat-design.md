# Choose-A-Seat 设计规格书

## 1. 项目概述

**项目名称：** Choose-A-Seat
**项目类型：** 微信小程序（旅行团/大巴选座系统）
**核心功能：** 管理员创建项目并管理车辆座位，普通用户通过项目key和密码选择座位
**目标用户：** 旅行团、大巴包车等场景

---

## 2. 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 |
| 后端 | 腾讯云 CloudBase 云函数 |
| 数据库 | CloudBase 数据库 |
| 用户标识 | 微信 openid |
| 通知 | 微信订阅消息 |

---

## 3. 数据库设计

### 3.1 projects（项目集合）

```json
{
  "_id": "ObjectId",
  "name": "string",
  "key": "string",
  "password": "string",
  "deadline": "Date",
  "createdBy": "string",
  "createdAt": "Date",
  "status": "number"
}
```

### 3.2 vehicles（车辆集合）

```json
{
  "_id": "ObjectId",
  "projectId": "string",
  "name": "string",
  "templateType": "string",
  "totalSeats": "number",
  "seats": [
    {
      "id": "string",
      "label": "string",
      "row": "number",
      "col": "number",
      "isDriver": "boolean",
      "isSelectable": "boolean",
      "status": "number",
      "userId": "string"
    }
  ],
  "createdAt": "Date"
}
```

### 3.3 users（用户集合）

```json
{
  "_id": "ObjectId",
  "openid": "string",
  "nickname": "string",
  "avatarUrl": "string",
  "role": "string",
  "createdAt": "Date"
}
```

### 3.4 selections（选座记录集合）

```json
{
  "_id": "ObjectId",
  "projectId": "string",
  "vehicleId": "string",
  "seatId": "string",
  "userId": "string",
  "selectedAt": "Date",
  "assignedBy": "string",
  "status": "number"
}
```

### 3.5 notifications（通知记录集合）

```json
{
  "_id": "ObjectId",
  "userId": "string",
  "type": "string",
  "title": "string",
  "content": "string",
  "read": "boolean",
  "createdAt": "Date"
}
```

---

## 4. 座位模板

### 4.1 支持车型

| 车型 | 模板类型 | 布局 | 座位数 |
|------|----------|------|--------|
| 5座小车 | sedan | 2+3 | 5 |
| 7座商务 | 商务车 | 2+2+3 | 7 |
| 9座车 | van | 2+2+2+3 | 9 |
| 33座中巴 | mid-bus | 2+2+2+2+... | 33 |
| 45座大巴 | bus-45 | 2+2+2+2+...+3 | 45 |
| 49座大巴 | bus-49 | 2+2+2+2+...+3 | 49 |
| 53座大巴 | bus-53 | 2+2+2+2+...+3 | 53 |

### 4.2 座位编号规则

- **列编号**：1=左1，2=左2，3=右1，4=右2
- **排编号**：从车头到车尾递增
- **座位ID格式**：`{列编号}{排号}`，如 A1、B2、C3、D4
  - A=列1（左1），B=列2（左2），C=列3（右1），D=列4（右2）

### 4.3 座位状态

| 状态值 | 含义 | 显示颜色 |
|--------|------|----------|
| 0 | 可选 | 绿色 #4CAF50 |
| 1 | 已选（用户自选） | 粉色 #E91E63 |
| 2 | 管理员锁定/分配 | 橙色 #FF9800 |
| -1 | 不可选（司机位等） | 灰色 #DDD |

---

## 5. 移动端适配规范

### 5.1 设计原则

- **竖屏优先**：所有页面采用竖屏布局，支持单手操作
- **触摸友好**：点击热区最小 44×44px，座位格子 48×52px
- **信息简洁**：每屏只展示核心信息，避免信息过载
- **操作便捷**：重要操作放在拇指易触及区域

### 5.2 选座页布局（核心页面）

```
┌────────────────────┐
│      顶部导航      │  ← 返回、项目名称、车型
├────────────────────┤
│     项目信息栏     │  ← 项目名、截止时间
├────────────────────┤
│                    │
│    车头（挡风玻璃） │  ← 固定显示
│                    │
│  ┌──┐ ┌──┐ ┌──┐  │
│  │司机│ │ │ │车门│  │  ← 司机位+车门（不可选）
│  └──┘ └──┘ └──┘  │
│                    │
│  ┌A┐┌B┐  ┌C┐┌D┐   │  ← 座位网格
│  │ ││ │  │ ││ │   │     左2列 + 过道 + 右2列
│  └─┘└─┘  └─┘└─┘   │     支持纵向滚动
│  ┌A┐┌B┐  ┌C┐┌D┐   │
│  │ ││ │  │ ││ │   │
│  └─┘└─┘  └─┘└─┘   │
│       ...          │
│                    │
├────────────────────┤
│   图例（底部）     │  ← 颜色说明
├────────────────────┤
│                    │
│  ┌────────┐ ┌────┐ │  ← 底部操作栏（固定）
│  │已选座位 │ │确认│ │
│  │  A3    │ │选座│ │
│  └────────┘ └────┘ │
└────────────────────┘
```

### 5.3 响应式处理

- **竖屏**：标准布局，座位网格纵向滚动
- **横屏**：提示用户旋转屏幕（小程序不建议支持横屏）
- **安全区域**：适配 iPhone X 及以上机型的底部安全区

---

## 6. 页面结构

### 6.1 普通用户页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | 输入项目key加入项目 |
| 密码验证 | `/pages/verify/verify` | 输入项目密码 |
| 车辆列表 | `/pages/vehicles/vehicles` | 选择车辆 |
| 选座页 | `/pages/seats/seats` | 核心选座界面 |
| 我的座位 | `/pages/my-seat/my-seat` | 查看已选座位 |

### 6.2 管理员页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录验证 | `/pages/admin/login/login` | 验证管理员身份 |
| 项目管理 | `/pages/admin/projects/list` | 项目列表/创建 |
| 项目详情 | `/pages/admin/projects/detail` | 编辑项目/设置截止时间 |
| 车辆管理 | `/pages/admin/vehicles/list` | 车辆列表/添加 |
| 座位管理 | `/pages/admin/seats/seats` | 查看座位状态/管理员改座 |

---

## 7. 核心 API

### 7.1 用户模块

| 云函数 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `getUserInfo` | openid | userInfo | 获取用户信息 |

### 7.2 项目模块

| 云函数 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `createProject` | name, password, createdBy | project, key | 创建项目 |
| `joinProject` | key, password | project, vehicles | 通过key和密码加入 |
| `getProject` | projectId | project | 获取项目详情 |
| `updateProject` | projectId, updates | success | 更新项目 |

### 7.3 车辆模块

| 云函数 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `createVehicle` | projectId, name, templateType | vehicle | 创建车辆 |
| `getVehicles` | projectId | vehicles | 获取项目下车辆列表 |
| `updateVehicle` | vehicleId, updates | success | 更新车辆 |

### 7.4 选座模块

| 云函数 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `selectSeat` | vehicleId, seatId, userId | success | 选择座位（事务） |
| `cancelSeat` | vehicleId, seatId, userId | success | 取消座位 |
| `assignSeat` | vehicleId, seatId, userId, adminId | success | 管理员分配座位 |
| `getSelections` | projectId, userId | selections | 获取用户选座记录 |

### 7.5 通知模块

| 云函数 | 参数 | 返回 | 说明 |
|--------|------|------|------|
| `sendNotification` | userId, type, title, content | success | 发送通知 |
| `getNotifications` | userId | notifications | 获取通知列表 |

---

## 8. 业务流程

### 8.1 用户选座流程

```
1. 用户打开小程序 → 首页
2. 输入项目key → 查询项目是否存在
3. 输入密码 → 验证密码是否正确
4. 选择车辆 → 进入选座页面
5. 查看座位布局 → 点击可选座位
6. 确认选座 → 云函数事务处理
7. 选座成功 → 显示已选座位
8. 截止时间前可取消/改座
```

### 8.2 选座冲突处理

```
用户A选择座位A1（同时用户B也选择A1）：
1. 云函数接收两个请求
2. 事务内检查座位状态
3. 第一个请求：状态为0，可选，标记为已选
4. 第二个请求：状态为1（已被占用），返回错误"座位已被选择"
5. 用户B看到座位变为已选，需要重新选择
```

### 8.3 管理员改座流程

```
1. 管理员进入座位管理页
2. 选择要改座的用户
3. 选择新的目标座位
4. 确认改座
5. 系统自动：
   - 原座位标记为可选
   - 新座位标记为管理员锁定（橙色）
   - 向被改座用户发送订阅消息通知
```

---

## 9. 安全考虑

1. **用户标识**：使用微信 openid 作为唯一标识，不可伪造
2. **项目密码**：传输过程 HTTPS 加密，存储时 bcrypt 哈希
3. **管理员权限**：管理员 openid 存储在项目 createdBy 字段，仅限创建者
4. **选座原子性**：云函数事务保证并发安全
5. **订阅消息**：用户需主动授权才可发送通知

---

## 10. 部署说明

### 10.1 微信小程序部署

1. 在微信公众平台注册小程序账号
2. 获取 AppID
3. 使用微信开发者工具导入项目
4. 配置服务器域名（request 合法域名）
5. 提交审核并发布

### 10.2 CloudBase 部署

1. 注册腾讯云账号，开通 CloudBase
2. 创建云开发环境
3. 部署云函数（将 `cloudfunctions` 目录下的函数部署）
4. 配置数据库集合和权限规则
5. 在小程序中初始化云开发：`wx.cloud.init()`

### 10.3 数据库初始化

需要在 CloudBase 控制台或通过云函数创建以下集合：
- `projects`
- `vehicles`
- `users`
- `selections`
- `notifications`

集合权限规则（初步配置）：
- `projects`: 仅管理员可写，所有人可读（根据项目key）
- `vehicles`: 仅管理员可写，所有人可读
- `users`: 仅自己可写，所有人可读
- `selections`: 仅自己和管理员可写，所有人可读
- `notifications`: 仅自己可写和读

---

## 11. 项目目录结构

```
Choose-A-Seat/
├── cloudfunctions/           # 云函数目录
│   ├── createProject/
│   ├── joinProject/
│   ├── createVehicle/
│   ├── selectSeat/
│   ├── cancelSeat/
│   ├── assignSeat/
│   ├── getNotifications/
│   └── sendNotification/
├── miniprogram/              # 小程序目录
│   ├── pages/
│   │   ├── index/            # 首页
│   │   ├── verify/           # 密码验证
│   │   ├── vehicles/         # 车辆列表
│   │   ├── seats/            # 选座页
│   │   ├── my-seat/           # 我的座位
│   │   └── admin/             # 管理员页面
│   │       ├── login/
│   │       ├── projects/
│   │       ├── vehicles/
│   │       └── seats/
│   ├── components/           # 公共组件
│   │   └── seat-grid/         # 座位网格组件
│   ├── templates/             # 座位模板配置
│   ├── utils/                 # 工具函数
│   ├── app.js
│   ├── app.json
│   └── app.wxss
├── docs/                      # 文档目录
│   └── superpowers/
│       └── specs/
│           └── 2026-05-07-choose-a-seat-design.md
└── README.md
```

---

## 12. MVP 范围

### 必须实现（MVP）

- [x] 用户输入项目key和密码加入项目
- [x] 查看项目下车辆列表
- [x] 可视化选座界面（支持45座大巴模板）
- [x] 选择座位（先到先得）
- [x] 取消已选座位
- [x] 管理员创建项目和车辆
- [x] 管理员设置选座截止时间
- [x] 管理员修改用户座位
- [x] 订阅消息通知（用户被管理员改座时）

### 暂不实现

- [ ] 多种车型座位模板（先实现45座）
- [ ] 项目历史记录和复用
- [ ] 支付功能
- [ ] 多管理员支持

---

*文档版本：v1.1*
*创建日期：2026-05-07*
*更新：添加移动端适配规范*
