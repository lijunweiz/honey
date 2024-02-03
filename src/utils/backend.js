import $ from 'jquery'

const BACKEND_IP = 'http://127.0.0.1'
const BACKEND_PORT = '8888'
export const BACKEND_ADDR = BACKEND_IP + ':' + BACKEND_PORT

export function loadLogicData(graphId) {
  let logicData = {}
  const old = $.ajaxSettings.async
  $.ajaxSettings.async = false
  $.getJSON(BACKEND_ADDR + '/g/query?gid' + graphId, function(data) {
    logicData = {
      nodes: data.nodes,
      edges: data.edges
    }
  })
  $.ajaxSettings.async = old
  return logicData
}
