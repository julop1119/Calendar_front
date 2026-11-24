import { useGroupContext } from '../context/GroupContext'
import { MemberList } from '../components/share/MemberList'
import { UserSearch } from '../components/share/UserSearch'
import { InviteList } from '../components/share/InviteList'
import { FullScreenSpinner } from '../components/common/Spinner'

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

  if (isLoading) {
    return <FullScreenSpinner />
  }

  return (
    <div className="divide-y divide-gray-100 pb-24">
      <Section title="받은 초대">
        <InviteList />
      </Section>

      {selectedGroupId && (
        <>
          <Section title={`"${selectedGroup?.title}" 멤버`}>
            <MemberList groupId={selectedGroupId} />
          </Section>

          <Section title="공유하기">
            <UserSearch groupId={selectedGroupId} />
          </Section>
        </>
      )}
    </div>
  )
}
