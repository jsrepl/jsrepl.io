import React from 'react'
import { TreeDataItem, TreeView } from '@/components/ui/tree-view'

export default {
  component: TreeView,
}

export const Default = () => {
  const data: TreeDataItem[] = [
    {
      id: '1',
      name: 'Item 1',
      children: [
        {
          id: '2',
          name: 'Item 1.1',
          children: [
            {
              id: '3',
              name: 'Item 1.1.1',
            },
            {
              id: '4',
              name: 'Item 1.1.2',
            },
          ],
        },
        {
          id: '5',
          name: 'Item 1.2',
        },
        {
          id: '6',
          name: 'Item 1.3',
          children: [
            {
              id: '7',
              name: 'Item 1.3.1',
            },
            {
              id: '8',
              name: 'Item 1.3.2',
            },
          ],
        },
      ],
    },
    {
      id: '9',
      name: 'Item 2',
    },
  ]

  return <TreeView data={data} />
}
