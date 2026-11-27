import { useGroupContext } from '../context/GroupContext'
import { MemberList } from '../components/share/MemberList'
import { UserSearch } from '../components/share/UserSearch'
import { InviteList } from '../components/share/InviteList'
import { FullScreenSpinner } from '../components/common/Spinner'
import { useTranslation, format } from '../i18n/useTranslation'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-4 py-4">
      <h2 className="mb-2 text-sm font-semibold text-gray-500">{title}</h2>
      {children}
    </section>
  )
}

export function SharePage() {
  const { selectedGroup, selectedGroupId, isLoading } = useGroupContext()
  const { t } = useTranslation()

  if (isLoading) {
    return <FullScreenSpinner />
  }

  return (
    <div className="divide-y divide-gray-100 pb-24">
      <Section title={t.share.receivedInvites}>
        <InviteList />
      </Section>

      {selectedGroupId && (
        <>
          <Section title={format(t.share.members, { title: selectedGroup?.title ?? '' })}>
            <MemberList groupId={selectedGroupId} />
          </Section>

          <Section title={t.share.shareTitle}>
            <UserSearch groupId={selectedGroupId} />
          </Section>
        </>
      )}
    </div>
  )
}
