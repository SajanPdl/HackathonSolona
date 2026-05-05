import { Users, Building, Gift } from 'lucide-react';

const useCases = [
  {
    icon: Users,
    title: 'Family Support',
    description: 'Send monthly allowances to parents and siblings in Nepal. No bank account needed for recipients.',
  },
  {
    icon: Building,
    title: 'Business Payments',
    description: 'Pay contractors and suppliers in Nepal instantly. Transparent, verifiable transactions.',
  },
  {
    icon: Gift,
    title: 'Special Occasions',
    description: 'Birthday, wedding, or festival gifts sent in minutes. Always arrives on time.',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            Perfect For Every Need
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            From everyday expenses to special moments, AamaPay makes sending money simple
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-[#F5F5F5] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 flex items-center justify-center mx-auto mb-6">
                <useCase.icon className="w-8 h-8 text-[#B91C1C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111827] mb-3">{useCase.title}</h3>
              <p className="text-[#6B7280]">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}