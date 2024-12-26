import CopilotItem from './status-bar/copilot-item'
import EsbuildStatusItem from './status-bar/esbuild-status-item'
import HasChangesItem from './status-bar/has-changes-item'
import LineColItem from './status-bar/line-col-item'
import ModelLanguageItem from './status-bar/model-language-item'
import PrettierStatusItem from './status-bar/prettier-status-item'
import ProblemsItem from './status-bar/problems-item'
import ReportIssueItem from './status-bar/report-issue-item'
import TitleItem from './status-bar/title-item'

export default function StatusBar() {
  return (
    <div className="bg-activityBar flex h-[1.375rem] gap-1 overflow-hidden text-xs leading-[1.375rem] [grid-area:status-bar]">
      <div className="flex grow gap-1">
        <TitleItem />
        <ProblemsItem />
        <HasChangesItem />
      </div>
      <div className="flex flex-row-reverse flex-wrap gap-1">
        <ReportIssueItem />
        <CopilotItem />
        <PrettierStatusItem />
        <EsbuildStatusItem />
        <ModelLanguageItem />
        <LineColItem />
      </div>
    </div>
  )
}
