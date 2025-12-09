import { Menus } from '@/types/menu';

export const menuData: Menus[] = [
  {
    id: '6',
    icon: 'DocumentAdd',
    index: '6',
    title: '附加页面',
    children: [
      {
        id: '62',
        pid: '6',
        index: '/login',
        title: '登录',
      },
      {
        id: '65',
        pid: '6',
        index: '/403',
        title: '403',
      },
      {
        id: '66',
        pid: '6',
        index: '/404',
        title: '404',
      },
    ],
  },
  {
    id: '1',
    icon: 'HomeFilled',
    index: '/scenarios-datasets',
    title: '业务场景与数据集',
  },
  {
    id: '2',
    icon: 'Odometer',
    index: '/model-management',
    title: '模型管理',
  },
  {
    id: '3',
    icon: 'Brush',
    index: '/evaluation-metrics',
    title: '评测指标管理',
  },
  {
    id: '4',
    icon: 'Menu',
    index: '/evaluation-task',
    title: '评测任务管理',
  },
  {
    id: '5',
    icon: 'MessageBox',
    index: '/evaluation-report',
    title: '评估报告管理',
  },
];
