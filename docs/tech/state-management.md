# 前端状态管理：从 React Hooks 到 Pinia

> 起因是 2022 年 3 月的一段讨论：
>
> * **问**：目前 React Hook 的写法搭配什么状态管理工具比较主流？MobX、Redux，还是 Rematch、SWR？
> * **答**：MobX 搭配 Context、依赖注入、Service 的思路，极其舒服，亲测好用。
>
> 本文把其中涉及的概念逐个展开，补充 Vue 生态的 Pinia，并给出 2026 年的选型建议。
>
> 版本与下载量数据取自 npm，截至 2026 年 10 月。示例代码使用 TypeScript。

## 一、 先分清两类状态

讨论“用什么状态管理”之前，先要分清楚管的是哪一类状态。很多项目的 Store 臃肿，根源就是把两类状态混在了一起。

| | 客户端状态（Client State） | 服务端状态（Server State） |
| --- | --- | --- |
| **数据归属** | 前端自己拥有 | 后端拥有，前端只是持有一份“缓存副本” |
| **典型例子** | 弹窗开关、表单输入、主题、当前选中的 Tab | 用户信息、商品列表、订单详情 |
| **核心难点** | 跨组件共享、更新逻辑清晰 | 缓存、过期、重新请求、去重、加载与错误状态 |
| **适合的工具** | Redux、MobX、Zustand、Jotai、Pinia | SWR、TanStack Query、RTK Query |

原问题里的几个工具其实分属两类：**MobX、Redux、Rematch 管客户端状态，SWR 管服务端状态**。它们不是互相替代的关系，而是经常**组合使用**。

---

## 二、 React 内置的状态能力

在引入任何第三方库之前，React 本身已经提供了一套状态管理能力。

### 1. React Hooks

Hooks 是 React 16.8（2019 年）引入的特性，让函数组件也能拥有状态和副作用。和状态相关的主要有三个：

| Hook | 作用 |
| --- | --- |
| `useState` | 组件内的简单状态 |
| `useReducer` | 组件内的复杂状态，用“动作 → 新状态”的方式更新，思路与 Redux 一致 |
| `useContext` | 读取上层组件通过 Context 提供的值 |

```tsx
import { useReducer } from 'react';

type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
  }
}

export function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return <button onClick={() => dispatch({ type: 'increment' })}>{count}</button>;
}
```

### 2. Context

Context 解决的是**跨层级传值**的问题：不用一层一层通过 props 往下传（俗称“props 透传”或 prop drilling）。

```tsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

export function App() {
  // React 19 起可以直接把 Context 当作 Provider 使用
  return (
    <ThemeContext value="dark">
      <Toolbar />
    </ThemeContext>
  );
}

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

**Context 不是状态管理工具**，它只是一个“传递通道”，有两个局限：

* **没有更新逻辑**：它只负责把值传下去，怎么改值还得靠 `useState` / `useReducer`。
* **粒度粗**：Context 的值一旦变化，所有读取它的组件都会重新渲染，即使组件只用到其中一个字段。

因此 Context 最适合传递**不常变化**的东西，比如主题、语言、当前用户，或者——下文会讲到的——**一个 Store 实例或 Service 实例的引用**。实例本身的引用不变，Context 就不会触发重渲染，细粒度的更新交给 MobX 之类的库处理。

---

## 三、 Redux 与 Redux Toolkit

### 1. 核心概念

Redux 诞生于 2015 年，灵感来自 Flux 架构和函数式编程，核心是**单向数据流**：

```text
 ┌──────────┐  dispatch(action)  ┌───────────┐  (state, action) => newState  ┌──────────┐
 │   View   │ ─────────────────▶ │  Reducer  │ ────────────────────────────▶ │  Store   │
 └──────────┘                    └───────────┘                               └──────────┘
       ▲                                                                           │
       └─────────────────────────── selector 订阅 state ─────────────────────────────┘
```

| 概念 | 含义 |
| --- | --- |
| **Store** | 全局唯一的状态容器 |
| **Action** | 一个描述“发生了什么”的普通对象，如 `{ type: 'todo/added', payload: '买菜' }` |
| **Reducer** | 纯函数：输入旧状态和 Action，返回新状态，**不能直接修改旧状态** |
| **Dispatch** | 派发 Action 的方法，是修改状态的唯一途径 |
| **Selector** | 从 Store 中读取所需数据的函数 |
| **Middleware** | 拦截 Action 的扩展点，用于处理异步、日志等，如 `redux-thunk` |

**优点**：状态变化完全可预测、可追溯，配合 Redux DevTools 可以“时间旅行”回放每一步操作，非常适合大型团队协作。

**缺点**：原生写法模板代码多，一个功能要写 action type、action creator、reducer 好几个地方。

### 2. Redux Toolkit（RTK）

为了解决模板代码问题，Redux 官方推出了 **Redux Toolkit**，现在是**官方唯一推荐的 Redux 写法**，原生的 `createStore` 已被标记为弃用。

```ts
// store.ts
import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    // RTK 内置 Immer，可以用“直接修改”的写法，实际会生成不可变的新状态
    added(state, action: PayloadAction<string>) {
      state.push({ id: Date.now(), title: action.payload, done: false });
    },
    toggled(state, action: PayloadAction<number>) {
      const todo = state.find((item) => item.id === action.payload);
      if (todo) todo.done = !todo.done;
    },
  },
});

export const { added, toggled } = todosSlice.actions;

export const store = configureStore({
  reducer: { todos: todosSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```tsx
// TodoList.tsx
import { useDispatch, useSelector } from 'react-redux';
import { added, type AppDispatch, type RootState } from './store';

const useAppSelector = useSelector.withTypes<RootState>();
const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export function TodoList() {
  const todos = useAppSelector((state) => state.todos);
  const dispatch = useAppDispatch();

  return (
    <>
      <button onClick={() => dispatch(added('买菜'))}>添加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </>
  );
}
```

RTK 还内置了 **RTK Query**，用来管理服务端状态，功能定位与下文的 SWR、TanStack Query 相同。

### 3. Rematch

Rematch 是基于 Redux 的一层封装，把 state、reducers、effects（异步逻辑）写在同一个 **model** 里，省掉了 action type 等模板代码。

```ts
import { createModel, init, type Models } from '@rematch/core';

export interface RootModel extends Models<RootModel> {
  count: typeof count;
}

export const count = createModel<RootModel>()({
  state: 0,
  reducers: {
    increment(state, payload: number) {
      return state + payload;
    },
  },
  effects: (dispatch) => ({
    async incrementAsync(payload: number) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dispatch.count.increment(payload);
    },
  }),
});

export const store = init<RootModel>({ models: { count } });
```

> **新项目不建议再选 Rematch**：它的 GitHub 仓库已被**归档**（只读，不再维护），npm 上最后一个版本 2.2.0 发布于 2021 年 11 月。Rematch 想解决的模板代码问题，Redux Toolkit 的 `createSlice` 已经官方解决了。

---

## 四、 MobX

### 1. 核心思想：响应式

MobX 走的是和 Redux 完全不同的路线：**响应式编程**（Reactive Programming），思路类似 Excel 表格——修改了一个单元格，所有引用它的公式会自动重新计算。

| 概念 | 含义 |
| --- | --- |
| **Observable（可观察状态）** | 被 MobX 追踪的数据 |
| **Action（动作）** | 修改 Observable 的方法 |
| **Computed（计算值）** | 由 Observable 派生出的值，自动缓存，依赖不变就不重新计算 |
| **Reaction（反应）** | 状态变化后自动执行的副作用，React 组件的重新渲染就是一种 Reaction |

与 Redux 的关键区别：

* **可以直接修改状态**：`this.count++` 就行，不需要返回新对象。
* **自动依赖追踪**：组件用到了哪些字段，MobX 就只在这些字段变化时重新渲染组件，天然是**细粒度更新**，不需要手写 selector。
* **面向对象**：Store 通常写成 class，状态和方法放在一起，对有后端或 OOP 背景的开发者很友好。

### 2. 基本用法

```ts
// TodoStore.ts
import { makeAutoObservable } from 'mobx';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export class TodoStore {
  todos: Todo[] = [];

  constructor() {
    // 自动把属性标记为 observable，getter 标记为 computed，方法标记为 action
    makeAutoObservable(this);
  }

  get unfinishedCount(): number {
    return this.todos.filter((todo) => !todo.done).length;
  }

  add(title: string): void {
    this.todos.push({ id: Date.now(), title, done: false });
  }
}
```

```tsx
// TodoView.tsx
import { observer } from 'mobx-react-lite';
import type { TodoStore } from './TodoStore';

// observer 让组件自动订阅它用到的 observable
export const TodoView = observer(({ store }: { store: TodoStore }) => (
  <div>
    <button onClick={() => store.add('买菜')}>添加</button>
    <span>未完成：{store.unfinishedCount}</span>
  </div>
));
```

> **MobX 7 的变化**（2026 年 7 月发布）：移除了旧版装饰器（legacy decorators）和非 Proxy 的兼容模式；`observable.ref`、`action.bound` 等命名空间写法改为独立导出的 `observableRef`、`actionBound`。上面使用的 `makeAutoObservable` 写法不受影响。

---

## 五、 MobX + Context + 依赖注入 + Service

这就是聊天里推荐的组合。它本质上是把**后端常见的分层架构**搬到了前端。

### 1. 涉及的三个概念

* **Service（服务层）**：把与 UI 无关的业务逻辑和 API 调用抽成独立的类，比如 `UserService` 负责登录、获取用户信息。组件只负责展示，不直接发请求。
* **依赖注入（Dependency Injection，DI）**：一个对象需要的依赖（比如 `UserStore` 需要 `UserService`）**不在内部自己 `new`，而是由外部传进来**。好处是解耦：测试时可以传入一个假的 Service，也可以方便地替换实现。
* **Context**：作为“注入通道”，在应用顶层创建好所有实例，通过 Context 提供给任意深度的组件。

### 2. 整体结构

```text
┌──────────────────────────────────────────────────────┐
│ RootStore（应用启动时创建，组装所有依赖）               │
│                                                      │
│   ApiClient ──注入──▶ UserService ──注入──▶ UserStore │
│                       TodoService ──注入──▶ TodoStore │
└──────────────────────────────────────────────────────┘
                         │ 通过 Context 提供
                         ▼
               组件里 useStores() 取用
```

### 3. 代码示例

```ts
// services/UserService.ts —— 只负责和后端打交道，不关心 UI
export interface User {
  id: string;
  name: string;
}

export class UserService {
  constructor(private readonly baseUrl: string) {}

  async fetchCurrentUser(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/api/me`);
    if (!response.ok) throw new Error(`请求失败：${response.status}`);
    return (await response.json()) as User;
  }
}
```

```ts
// stores/UserStore.ts —— 持有状态，依赖通过构造函数注入
import { makeAutoObservable, runInAction } from 'mobx';
import type { User, UserService } from '../services/UserService';

export class UserStore {
  user: User | null = null;
  loading = false;

  constructor(private readonly userService: UserService) {
    makeAutoObservable(this);
  }

  async load(): Promise<void> {
    this.loading = true;
    try {
      const user = await this.userService.fetchCurrentUser();
      // await 之后的修改需要包在 runInAction 里
      runInAction(() => {
        this.user = user;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}
```

```tsx
// stores/RootStore.tsx —— 组装依赖，并通过 Context 提供
import { createContext, useContext, type ReactNode } from 'react';
import { UserService } from '../services/UserService';
import { UserStore } from './UserStore';

export class RootStore {
  readonly userStore: UserStore;

  constructor(userService: UserService) {
    this.userStore = new UserStore(userService);
  }
}

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ store, children }: { store: RootStore; children: ReactNode }) {
  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useStores(): RootStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStores 必须在 StoreProvider 内部使用');
  return store;
}
```

```tsx
// main.tsx —— 应用入口，唯一一处“new”所有依赖的地方
import { createRoot } from 'react-dom/client';
import { RootStore, StoreProvider } from './stores/RootStore';
import { UserService } from './services/UserService';
import { App } from './App';

const rootStore = new RootStore(new UserService('https://example.com'));

createRoot(document.getElementById('root')!).render(
  <StoreProvider store={rootStore}>
    <App />
  </StoreProvider>,
);
```

```tsx
// Profile.tsx —— 组件只管展示
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from './stores/RootStore';

export const Profile = observer(() => {
  const { userStore } = useStores();

  useEffect(() => {
    void userStore.load();
  }, [userStore]);

  if (userStore.loading) return <p>加载中...</p>;
  return <p>你好，{userStore.user?.name}</p>;
});
```

单元测试时，只要给 `UserStore` 传入一个假的 `UserService`，就能脱离网络测试状态逻辑：

```ts
const fakeService = { fetchCurrentUser: async () => ({ id: '1', name: '测试用户' }) } as UserService;
const store = new UserStore(fakeService);
await store.load();
expect(store.user?.name).toBe('测试用户');
```

### 4. 优缺点

| 优点 | 缺点 |
| --- | --- |
| 分层清晰：组件管展示、Store 管状态、Service 管业务和接口 | 类和文件较多，小项目显得重 |
| 依赖可替换，单元测试友好 | 需要团队对 OOP 和响应式有共同理解 |
| MobX 的细粒度更新 + Context 只传引用，性能好 | 状态变化不如 Redux 那样“每一步都可回放” |
| 熟悉 Angular、NestJS、Spring 的开发者上手快 | 前端社区的主流示例更多基于 Redux / Zustand |

> 依赖较多时可以引入 DI 容器自动组装，比如 [InversifyJS](https://inversify.io/)、[TSyringe](https://github.com/microsoft/tsyringe)。中小项目像上面这样在入口处手动组装就足够了。

---

## 六、 SWR：服务端状态管理

### 1. 名字的由来

SWR 由 Vercel（Next.js 背后的公司）开发，名字来自 HTTP 缓存策略 **stale-while-revalidate**（定义于 [RFC 5861](https://datatracker.ietf.org/doc/html/rfc5861)）：

1. 先立即返回缓存里的旧数据（stale），页面马上就有内容；
2. 同时在后台发请求重新验证（revalidate）；
3. 拿到新数据后自动更新页面。

### 2. 基本用法

```tsx
import useSWR from 'swr';

interface User {
  id: string;
  name: string;
}

const fetcher = async (url: string): Promise<User> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`请求失败：${response.status}`);
  return (await response.json()) as User;
};

export function Profile() {
  const { data, error, isLoading } = useSWR('/api/me', fetcher);

  if (error) return <p>加载失败</p>;
  if (isLoading) return <p>加载中...</p>;
  return <p>你好，{data?.name}</p>;
}
```

一行 `useSWR` 自动处理了：

* **缓存与去重**：多个组件同时请求 `/api/me`，只会发一次请求。
* **自动重新验证**：窗口重新聚焦、网络恢复时自动刷新数据。
* **加载与错误状态**：不用自己维护 `loading`、`error` 变量。
* **乐观更新**：通过 `mutate` 先更新界面，再等服务端确认。

对比上一节手写的 `UserStore.load()`，可以看出：**如果一个 Store 里主要是“请求接口、存结果、管 loading”，那它更适合交给 SWR**，Store 只保留真正的客户端状态。

### 3. TanStack Query

[TanStack Query](https://tanstack.com/query)（原名 React Query）是同类中功能更全的方案，提供了更完善的缓存控制、分页、无限滚动和开发者工具，并且支持 Vue、Solid、Svelte 等框架。从 npm 下载量看，它是目前最主流的服务端状态库。

```tsx
import { useQuery } from '@tanstack/react-query';

const { data, isPending } = useQuery({ queryKey: ['me'], queryFn: () => fetcher('/api/me') });
```

---

## 七、 后起之秀：Zustand 与 Jotai

聊天发生在 2022 年，此后状态管理领域的格局有了明显变化，以下两个库值得了解。

### 1. Zustand

一个极简的 Store 库，没有 Provider、没有模板代码，API 只有一个 `create`。从 npm 下载量看，它已经超过 Redux Toolkit，成为 React 生态最流行的客户端状态库。

```ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// 组件中：只订阅 count，其他字段变化不会触发重渲染
// const count = useCounterStore((state) => state.count);
```

### 2. Jotai

**原子化**（Atomic）状态管理：把状态拆成一个个独立的小“原子”（atom），组件按需组合，用法和 `useState` 几乎一样。

```ts
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

// 组件中：
// const [count, setCount] = useAtom(countAtom);
```

> Zustand 和 Jotai 出自同一个开源组织 [pmndrs](https://github.com/pmndrs)。

---

## 八、 Pinia：Vue 的官方状态管理

### 1. 定位

[Pinia](https://pinia.vuejs.org/) 是 **Vue 官方推荐的状态管理库**，取代了 Vuex。Vuex 目前处于维护模式，最后一个版本 4.1.0 发布于 2022 年 10 月，Vue 官方文档建议新项目使用 Pinia。

| 对比 | Vuex | Pinia |
| --- | --- | --- |
| 修改状态 | 必须通过 `mutations`，异步放在 `actions` | 去掉了 `mutations`，`actions` 里同步、异步都可以直接改 |
| 模块化 | 一个大 Store 嵌套 `modules`，需要命名空间 | 天然多 Store，每个 Store 独立定义、按需引入 |
| TypeScript | 类型推导较弱 | 完整的类型推导，几乎不用手写类型 |
| 组合式 API | 支持有限 | 原生支持，可以直接用 `ref`、`computed` 定义 Store |
| 体积 | 较大 | 约 1.5 KB |

### 2. 两种写法

**Option Store**：写法接近 Vuex，`state`、`getters`、`actions` 分开声明。

```ts
// stores/counter.ts
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2,
  },
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

**Setup Store**：使用组合式 API，`ref` 就是 state，`computed` 就是 getter，普通函数就是 action。

```ts
// stores/user.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface User {
  id: string;
  name: string;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => user.value !== null);

  async function load(): Promise<void> {
    const response = await fetch('/api/me');
    user.value = (await response.json()) as User;
  }

  return { user, isLoggedIn, load };
});
```

### 3. 注册与使用

```ts
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

createApp(App).use(createPinia()).mount('#app');
```

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCounterStore } from './stores/counter';

const counter = useCounterStore();
// 直接解构会丢失响应式，state 和 getter 需要用 storeToRefs 解构；action 可以直接解构
const { count, double } = storeToRefs(counter);
const { increment } = counter;
</script>

<template>
  <button @click="increment">{{ count }} × 2 = {{ double }}</button>
</template>
```

### 4. 与 MobX 的相似之处

Pinia 和 MobX 的思路非常接近：都基于**响应式**（Vue 的响应式系统本身就和 MobX 同源，都是依赖追踪 + 自动更新）、都允许**直接修改状态**、都能实现**细粒度更新**。可以说，Vue 开发者用 Pinia 得到的体验，就是 React 开发者用 MobX 想要的体验。

> **Pinia 4 的变化**（2026 年 7 月发布）：只包含技术层面的破坏性变更——**仅支持 ESM**，并且需要**手动安装 `@vue/devtools-api`**（已改为 peer 依赖）。业务代码的写法没有变化。
>
> ```bash
> npm install pinia @vue/devtools-api
> ```

---

## 九、 总结与选型

### 1. 横向对比

| 库 | 框架 | 类型 | 设计思想 | 最新版本 | npm 周下载量 |
| --- | --- | --- | --- | --- | --- |
| Redux Toolkit | React（及其他） | 客户端状态 | 单向数据流、不可变 | 2.13 | 约 4600 万 |
| MobX | 框架无关 | 客户端状态 | 响应式、可变 | 7.1 | 约 470 万 |
| Rematch | React | 客户端状态 | Redux 封装 | 2.2（**已归档**） | 约 5 万 |
| Zustand | React | 客户端状态 | 极简 Store | 5.0 | 约 8700 万 |
| Jotai | React | 客户端状态 | 原子化 | 3.0 | 约 900 万 |
| SWR | React | 服务端状态 | stale-while-revalidate | 2.5 | 约 2600 万 |
| TanStack Query | 多框架 | 服务端状态 | 异步状态缓存 | 5.105 | 约 7900 万 |
| Pinia | Vue | 客户端状态 | 响应式、组合式 | 4.1 | 约 750 万 |
| Vuex | Vue | 客户端状态 | Flux 风格 | 4.1（维护模式） | 约 210 万 |

> 下载量包含被其他库间接依赖的部分，只能反映大致的流行趋势，不完全等于直接使用的项目数量。

### 2. 选型建议

回到最初的问题：“React Hook 搭配什么状态管理工具比较主流？”2026 年的答案是：

1. **先拆分服务端状态**：接口数据交给 **TanStack Query** 或 **SWR**，这一步通常能让 Store 里的代码减少一大半。
2. **剩下的客户端状态**：
   * 状态不多：`useState` + Context 就够了，不用引入任何库；
   * 想要简单好用：**Zustand**；
   * 大型团队、需要严格规范和可追溯：**Redux Toolkit**；
   * 业务逻辑复杂、团队熟悉 OOP：**MobX + Context + 依赖注入 + Service**，也就是聊天里推荐的方案，依然是一个优秀的选择；
   * 状态之间派生关系多、需要细粒度组合：**Jotai**。
3. **Vue 项目**：直接用 **Pinia**，配合 TanStack Query（Vue 版）管理接口数据。
4. **不建议新项目选用**：Rematch（已归档）、Vuex（维护模式）、原生 Redux（官方已推荐 RTK）。
