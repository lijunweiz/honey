export const nodeList = [
  {
    text: '开始',
    type: 'start',
    class: 'node-start'
  },
  {
    text: '节点',
    type: 'rect',
    class: 'node-rect'
  },
  {
    text: '条件',
    type: 'condition',
    class: 'node-condition'
  },
  {
    text: '结束',
    type: 'end',
    class: 'node-end'
  }
]

export const BpmnNode = [
  {
    type: 'bpmn:startEvent',
    text: '开始',
    class: 'bpmn-start'
  },
  {
    type: 'bpmn:endEvent',
    text: '结束',
    class: 'bpmn-end'
  },
  {
    type: 'bpmn:exclusiveGateway',
    text: '网关',
    class: 'bpmn-exclusiveGateway'
  },
  {
    type: 'bpmn:userTask',
    text: '用户',
    class: 'bpmn-user'
  }
]
