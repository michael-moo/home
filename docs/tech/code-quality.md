---
description: 个人代码质量规范 - 注释格式、拼写检查、类型安全
globs: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.vue,**/*.css,**/*.scss,**/*.less,**/*.html,**/*.md,**/*.json"
version: 1.0.0
alwaysApply: true
---

# 个人代码质量规范

本规范定义了代码生成和修改时必须遵守的质量标准。

---

## 规则 1: 中英文之间必须有空格

### 核心原则

**在所有注释、文档、字符串中，中文和英文/数字之间必须添加空格。**

### 正确示例

```typescript
// 正确：中英文之间有空格
// 这是一个 Button 组件，用于处理 click 事件
// 该函数返回 Promise 对象，包含 user 信息
// 版本号为 1.0.0，发布于 2024 年

const message = '请输入 username 和 password';
const tip = '最多可上传 10 个文件';

/**
 * 获取 User 信息
 * @param userId - 用户 ID
 * @returns 返回 Promise 包含用户数据
 */
```

### 错误示例

```typescript
// 错误：中英文之间没有空格
// 这是一个Button组件，用于处理click事件  ❌
// 该函数返回Promise对象，包含user信息  ❌
// 版本号为1.0.0，发布于2024年  ❌

const message = '请输入username和password';  // ❌
const tip = '最多可上传10个文件';  // ❌
```

### 适用范围

- 代码注释（单行注释、多行注释、JSDoc）
- Markdown 文档
- 用户提示信息（toast、message、alert 等）
- 日志输出信息
- 错误信息描述

---

## 规则 2: 禁止单词拼写错误

### 核心原则

**所有代码中的英文单词必须拼写正确，包括变量名、函数名、注释、字符串等。**

### 常见易错单词

| 错误拼写 | 正确拼写 |
|---------|---------|
| `recieve` | `receive` |
| `occured` | `occurred` |
| `seperate` | `separate` |
| `successed` | `succeeded` |
| `destory` | `destroy` |
| `bindding` | `binding` |
| `calback` | `callback` |
| `enviroment` | `environment` |
| `paramater` | `parameter` |
| `asyncronous` | `asynchronous` |
| `initalize` | `initialize` |
| `definately` | `definitely` |
| `neccessary` | `necessary` |
| `occassion` | `occasion` |
| `wierd` | `weird` |
| `lenght` | `length` |
| `widht` | `width` |
| `heigth` | `height` |
| `visable` | `visible` |
| `avaliable` | `available` |
| `reponse` | `response` |
| `reqeust` | `request` |
| `cancle` | `cancel` |
| `sucess` | `success` |
| `faild` | `failed` |
| `udpate` | `update` |
| `delte` | `delete` |
| `retrun` | `return` |
| `ture` | `true` |
| `flase` | `false` |
| `Referer` | 注意：HTTP Header 中 `Referer` 是历史遗留的错误拼写，保持原样 |

### 检查范围

- 变量名、常量名
- 函数名、方法名
- 类名、接口名、类型别名
- 注释内容
- 字符串内容
- 文件名、目录名

---

## 规则 3: 禁止使用 any 弱化类型

### 核心原则

**TypeScript 代码中禁止使用 `any` 类型。必须使用具体类型、泛型或 `unknown` 替代。**

### 正确做法

```typescript
// ✅ 使用具体类型
function processUser(user: User): void {
  console.log(user.name);
}

// ✅ 使用泛型
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// ✅ 使用 unknown + 类型守卫
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  if (typeof data === 'number') {
    return data.toString();
  }
  throw new Error('Unsupported data type');
}

// ✅ 使用 Record 替代对象类型
function processConfig(config: Record<string, string | number>): void {
  // ...
}

// ✅ 使用联合类型
type AllowedTypes = string | number | boolean | null;
function handleValue(value: AllowedTypes): void {
  // ...
}

// ✅ 使用索引签名
interface DynamicObject {
  [key: string]: unknown;
}
```

### 错误做法

```typescript
// ❌ 直接使用 any
function processData(data: any): void {
  console.log(data.name);  // 无类型检查
}

// ❌ 使用 any[]
function getItems(): any[] {
  return [1, 'two', { three: 3 }];
}

// ❌ 类型断言为 any
const result = (someValue as any).property;

// ❌ 函数参数使用 any
const handler = (event: any) => {
  // ...
};

// ❌ 泛型默认值为 any
function fetch<T = any>(url: string): Promise<T> {
  // ...
}
```

### 例外情况

以下情况可以使用 `any`，但必须添加 `eslint-disable` 注释并说明原因：

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 第三方库类型定义缺失
declare module 'legacy-library' {
  export function legacyMethod(arg: any): any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON.parse 返回值无法预知类型
const parsed = JSON.parse(jsonString) as unknown;  // 优先使用 unknown
```

### 替代方案速查

| 场景 | 错误写法 | 正确写法 |
|-----|---------|---------|
| 未知结构对象 | `obj: any` | `obj: unknown` 或 `obj: Record<string, unknown>` |
| 动态数组 | `arr: any[]` | `arr: unknown[]` 或具体类型数组 |
| 函数参数不定 | `(...args: any[])` | `(...args: unknown[])` 或重载 |
| 第三方库返回值 | `result: any` | 定义接口或使用 `unknown` |
| 事件处理 | `event: any` | 使用具体事件类型如 `MouseEvent` |
| API 响应 | `response: any` | 定义响应接口 |

---

## 总结

| 规则 | 要求 | 严重程度 |
|-----|------|---------|
| 中英文空格 | 中英文/数字之间必须有空格 | 必须遵守 |
| 拼写检查 | 所有英文单词必须拼写正确 | 必须遵守 |
| 禁用 any | 禁止使用 any，改用具体类型或 unknown | 必须遵守 |

**这些规则适用于所有新增和修改的代码。**
